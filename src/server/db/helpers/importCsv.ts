/**
 * importCsv.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import fs from "fs";
import copyFrom from "pg-copy-streams";
import { Logs } from "../../logger";
import { IcsvColumn, IcsvFile } from "../../types";
import readline from "readline";
import { Knex } from "knex";
import koa from "koa";
import { DBDATAS } from "../constants";

/**
 *
 * @param knex knex transaction
 * @param tableName tempTableName
 * @param filename csv file to import
 * @param sql SQL request to import
 * @param logger logger instance
 * @returns results infos
 */

interface ICsvImport {
    dateSql: string;
    columns: string[];
}

const dateSqlRequest = async (paramsFile: IcsvFile): Promise<ICsvImport | undefined> => {
    const returnValue: ICsvImport = { dateSql: "", columns: [] };
    const fileStream = fs.createReadStream(paramsFile.filename);
    const regexDate = /^[0-9]{2}[\/][0-9]{2}[\/][0-9]{4}$/g;
    const regexHour = /^[0-9]{2}[:][0-9]{2}[:][0-9]{2}$/g;
    const regexDateHour = /^[0-9]{2}[\/][0-9]{2}[\/][0-9]{4} [0-9]{2}[:][0-9]{2}$/g;
    // TODO More easier
    // const regexDateHourComplete = /^[0-9]{2}[\/][0-9]{2}[\/][0-9]{4} [0-9]{2}[:][0-9]{2}[:][0-9]{2}$/g;

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in filename as a single line break.

    for await (const line of rl) {
        const splitColumns = line.split(";");
        if (regexDateHour.test(splitColumns[0]) == true) {
            const nbCol = (line.match(/;/g) || []).length;
            Logs.result("dateSqlRequest", "Date Hour");
            returnValue.columns = ["datehour"];
            for (let i = 0; i < nbCol; i++) returnValue.columns.push(`value${i + 1}`);

            fileStream.destroy();
            returnValue.dateSql = `TO_TIMESTAMP(REPLACE("${paramsFile.tempTable}".datehour, '24:00:00', '23:59:59'), 'DD/MM/YYYY HH24:MI:SS')`;
            return returnValue;
        } else if (regexDate.test(splitColumns[0]) == true && regexHour.test(splitColumns[1]) == true) {
            Logs.result("dateSqlRequest", "date ; hour");
            const nbCol = (line.match(/;/g) || []).length;

            returnValue.columns = ["date", "hour"];
            for (let i = 0; i < nbCol - 1; i++) returnValue.columns.push(`value${i + 1}`);

            fileStream.destroy();
            returnValue.dateSql = `TO_TIMESTAMP(concat("${paramsFile.tempTable}".date, REPLACE("${paramsFile.tempTable}".hour, '24:00:00', '23:59:59')), 'DD/MM/YYYYHH24:MI:SS:MS')`;
            return returnValue;
        }
    }
    return returnValue;
};
export const createColumnHeaderName = async (filename: string): Promise<string[] | undefined> => {
    const fileStream = fs.createReadStream(filename);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in filename as a single line break.

    for await (const line of rl) {
        try {
            const cols = line.split(";").map((e: string) => e.replace(/\./g,'').toLowerCase());
            fileStream.destroy();
            return cols;
        } catch (error) {
            console.log(error);
            
        }
    }
};
export const importCsv = async (ctx: koa.Context, knex: Knex | Knex.Transaction, paramsFile: IcsvFile): Promise<string[]> => {
    Logs.head("importCsv");
    const returnValue: string[] = [];

    const sqlRequest = await dateSqlRequest(paramsFile);

    if (sqlRequest) {
        await knex.schema
            .createTable(paramsFile.tempTable, (table) => {
                table.increments("id").unsigned().notNullable().primary();
                sqlRequest.columns.forEach((value) => table.string(value));
            })
            .catch((err: Error) => ctx.throw(400, { detail: err.message }));

        Logs.debug("Create Table", paramsFile.tempTable);

        await new Promise<void>((resolve, reject) => {
            knex.transaction(async (tx) => {
                const cleanup = (valid: boolean, err?: Error) => {
                    if (valid == true) tx.commit();
                    else tx.rollback();
                    if (err) reject(err);
                };

                const client = await tx.client.acquireConnection().catch((err: Error) => reject(err));

                const stream = client
                    .query(
                        copyFrom.from(
                            `COPY ${paramsFile.tempTable} (${sqlRequest.columns.join(",")}) FROM STDIN WITH (FORMAT csv, DELIMITER ';'${paramsFile.header})`
                        )
                    )
                    .on("error", (err: Error) => {
                        Logs.error("stream error", err);
                        reject(err);
                    });

                const fileStream = fs.createReadStream(paramsFile.filename);

                fileStream.on("error", (err: Error) => {
                    Logs.error("fileStream error", err);
                    cleanup(false, err);
                });

                fileStream.on("end", async () => {
                    Logs.debug("COPY TO ", paramsFile.tempTable);
                    const scriptSql: string[] = [];
                    const scriptSqlResult: string[] = [];

                    Object.keys(paramsFile.columns).forEach(async (myColumn: string, index: number) => {
                        const csvColumn: IcsvColumn = paramsFile.columns[myColumn];
                        const valueSql = `CASE "${paramsFile.tempTable}".value${csvColumn.column} WHEN '---' THEN NULL ELSE cast(REPLACE(value${csvColumn.column},',','.') as float) END`;
                        scriptSql.push(`${index == 0 ? "WITH" : ","} updated${index + 1} as (INSERT into "${ DBDATAS.Observations.table }" ("datastream_id", "featureofinterest_id", "phenomenonTime","resultTime", "_resultnumber") SELECT ${csvColumn.datastream}, ${ csvColumn.featureOfInterest },  ${sqlRequest.dateSql}, ${sqlRequest.dateSql},${valueSql} FROM "${paramsFile.tempTable}" ON CONFLICT DO NOTHING returning id)`);
                        scriptSqlResult.push(index == 0 ? " SELECT id FROM updated1" : ` UNION SELECT id FROM updated${index + 1}`);

                    });
                    scriptSql.push(scriptSqlResult.join(""));

                    const mySql = scriptSql.join("");
                    Logs.result("query", mySql);
                    
                    const res = await client.query(mySql).catch((err: Error) => {
                        cleanup(false, err);
                    });

                    Logs.debug("SQL Executing", "Ok");
                    if (res && res["rows"])
                        res["rows"]
                            .map((elem: { [key: string]: string }) => elem["id"])
                            .forEach((element: string) => {
                                returnValue.push(element);
                            });
                    else Logs.error("Query", "no result");

                    cleanup(true);
                    resolve();
                });

                fileStream.pipe(stream);
            }).catch((err: Error) => reject(err));
        }).catch((err: Error) => {
            ctx.throw(400, { detail: err.message });
        });
    }
    return returnValue;

};

