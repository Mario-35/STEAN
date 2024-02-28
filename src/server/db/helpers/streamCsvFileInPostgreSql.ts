/**
 * streamCsvFileInPostgreSql.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import fs from "fs";
import { formatLog } from "../../logger";
import { IcsvColumn, IcsvFile, IcsvImport } from "../../types";
import readline from "readline";
import koa from "koa";
import { createReadStream } from 'fs';
import { addAbortSignal } from 'stream';
import { serverConfig } from "../../configuration";
import { createCsvColumnsNameImport, executeSql } from ".";
import { log } from "../../log";
import { ADMIN } from "../../constants";

export const createColumnHeaderName = async ( filename: string ): Promise<string[] | undefined> => {
  const fileStream = fs.createReadStream(filename);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in filename as a single line break.

  for await (const line of rl) {
    try {
      const cols = line
        .split(";")
        .map((e: string) => e.replace(/\./g, "").toLowerCase());

      fileStream.destroy();
      return cols;
    } catch (error) {
      log.errorMsg(error);
    }
  }
};

const createImportColumnsNameImport = async ( paramsFile: IcsvFile ): Promise<IcsvImport | undefined> => {
  console.log(formatLog.whereIam());
  const query = await serverConfig.getConnectionAdminForImport().unsafe(`SELECT description FROM pg_description JOIN pg_class ON pg_description.objoid = pg_class.oid WHERE relname = '${paramsFile.tempTable}' AND description LIKE '%dateSql%'`);
  return (query[0] && query[0].description) ?  JSON.parse(query[0].description) : undefined;
}

export const streamCsvFileInPostgreSql = async ( ctx: koa.Context, paramsFile: IcsvFile ): Promise<string | undefined> => {
  console.log(formatLog.whereIam());
  // const importMode: boolean = paramsFile.filename.toUpperCase() === "IMPORT";
  let returnValue = undefined;
  const sqlRequest =  (paramsFile.filename !== "import") ? await createCsvColumnsNameImport(paramsFile) : await createImportColumnsNameImport(paramsFile);
  if (sqlRequest) {
  if (paramsFile.filename !== "import") {
    const controller = new AbortController();
    const readable = createReadStream(paramsFile.filename);
    const cols:string[] = [];
    sqlRequest.columns.forEach((value) => cols.push(`"${value}" varchar(255) NULL`));
    const createTable = `CREATE TABLE public."${paramsFile.tempTable}" ( id serial4 NOT NULL, ${cols}, CONSTRAINT ${paramsFile.tempTable}_pkey PRIMARY KEY (id));`;
    await executeSql(ctx.config, createTable);
    const writable = serverConfig.getConnection(ctx.config.name).unsafe(`COPY ${paramsFile.tempTable}  (${sqlRequest.columns.join( "," )}) FROM STDIN WITH(FORMAT csv, DELIMITER ';'${ paramsFile.header })`).writable();
  
    readable
      .pipe(addAbortSignal(controller.signal, await writable))
      .on('error', () => {
        log.errorMsg('ABORTED-STREAM'); // this executed
      });
    }
    const fileImport = paramsFile.filename.split("/").reverse()[0];
    const dateImport = new Date().toLocaleString();

    // stream finshed so COPY
    console.log(formatLog.debug("COPY TO ", paramsFile.tempTable));
    const scriptSql: string[] = [];
    const scriptSqlResult: string[] = [];
    // make import query
    if (paramsFile.filename === "import") {
      scriptSql.push(`SELECT dblink_connect('host=localhost user=${serverConfig.getConfig(ADMIN).pg.user} password=${serverConfig.getConfig(ADMIN).pg.password} dbname=admin');`);
      scriptSql.push(`WITH ${paramsFile.tempTable} AS (SELECT * FROM dblink('SELECT "date", "hour", "value1" FROM "${paramsFile.tempTable}"') as i("date" TEXT, "hour" text, "value1" TEXT))`);
    }
    Object.keys(paramsFile.columns).forEach(
      async (myColumn: string, index: number) => {
        const csvColumn: IcsvColumn = paramsFile.columns[myColumn];
        const valueSql = `json_build_object('value', CASE "${paramsFile.tempTable}".value${csvColumn.column} WHEN '---' THEN NULL ELSE cast(REPLACE(value${csvColumn.column},',','.') AS float) END)`;
        // `, updated${
        scriptSql.push(
          `${index == 0 && paramsFile.filename !== "import" ? "WITH" : ","} updated${
            index + 1
          } AS (INSERT into "${
            ctx.model.Observations.table
          }" ("${csvColumn.stream.type?.toLowerCase()}_id", "featureofinterest_id", "phenomenonTime","resultTime", "result", "resultQuality") SELECT ${
            csvColumn.stream.id
          }, ${csvColumn.stream.FoId},  ${sqlRequest.dateSql}, ${
            sqlRequest.dateSql
          },${valueSql}, '{"import": "${fileImport}","date": "${dateImport}"}'  FROM "${
            paramsFile.tempTable
          }" ON CONFLICT DO NOTHING returning 1)`
        );
        scriptSqlResult.push(
          index == 0
            ? ` SELECT (SELECT count(*) FROM ${paramsFile.tempTable}) AS total, (SELECT count(updated1) FROM updated1`
            : ` UNION SELECT count(updated${index + 1}) FROM updated${ index + 1 }`
        );
      }
    );
    scriptSqlResult.push(") AS inserted");
    scriptSql.push(scriptSqlResult.join(""));
    returnValue = scriptSql.join("");
    console.log(returnValue);
    
    return returnValue;
  }   
  return returnValue;
};


