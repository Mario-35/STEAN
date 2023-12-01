/**
 * streamCsvFileInPostgreSql.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import fs from "fs";
import { Logs } from "../../logger";
import { IcsvColumn, IcsvFile } from "../../types";
import readline from "readline";
import koa from "koa";
import { _DB } from "../constants";
import { createReadStream } from 'fs';
import { addAbortSignal } from 'stream';
import { serverConfig } from "../../configuration";
import { executeSql } from ".";

interface ICsvImport {
  dateSql: string;
  columns: string[];
}

const dateSqlRequest = async ( paramsFile: IcsvFile ): Promise<ICsvImport | undefined> => {
  const returnValue: ICsvImport = { dateSql: "", columns: [] };
  const fileStream = fs.createReadStream(paramsFile.filename);
  const regexDate = /^[0-9]{2}[\/][0-9]{2}[\/][0-9]{4}$/g;
  const regexHour = /^[0-9]{2}[:][0-9]{2}[:][0-9]{2}$/g;
  const regexDateHour =
    /^[0-9]{2}[\/][0-9]{2}[\/][0-9]{4} [0-9]{2}[:][0-9]{2}$/g;
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
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
    } else if (
      regexDate.test(splitColumns[0]) == true &&
      regexHour.test(splitColumns[1]) == true
    ) {
      Logs.result("dateSqlRequest", "date ; hour");
      const nbCol = (line.match(/;/g) || []).length;

      returnValue.columns = ["date", "hour"];
      for (let i = 0; i < nbCol - 1; i++)
        returnValue.columns.push(`value${i + 1}`);

      fileStream.destroy();
      returnValue.dateSql = `TO_TIMESTAMP(concat("${paramsFile.tempTable}".date, REPLACE("${paramsFile.tempTable}".hour, '24:00:00', '23:59:59')), 'DD/MM/YYYYHH24:MI:SS:MS')`;
      return returnValue;
    }
  }
  return returnValue;
};

export const createColumnHeaderName = async (
  filename: string
): Promise<string[] | undefined> => {
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
      Logs.error(error);
    }
  }
};

export const streamCsvFileInPostgreSql = async ( ctx: koa.Context, configName: string, paramsFile: IcsvFile ): Promise<string | undefined> => {
  Logs.whereIam();
  let returnValue = undefined;
  const sqlRequest = await dateSqlRequest(paramsFile);
  if (sqlRequest) {
    const controller = new AbortController();
    const readable = createReadStream(paramsFile.filename);
    const cols:string[] = [];
    sqlRequest.columns.forEach((value) => cols.push(`"${value}" varchar(255) NULL`));
    const createTable = `CREATE TABLE public."${paramsFile.tempTable}" ( id serial4 NOT NULL, ${cols}, CONSTRAINT ${paramsFile.tempTable}_pkey PRIMARY KEY (id));`;
    await executeSql(ctx._config.name, createTable);
    const writable = serverConfig.db(configName).unsafe(`COPY ${paramsFile.tempTable}  (${sqlRequest.columns.join( "," )}) FROM STDIN WITH(FORMAT csv, DELIMITER ';'${ paramsFile.header })`).writable();
  
    readable
      .pipe(addAbortSignal(controller.signal, await writable))
      .on('error', () => {
        Logs.error('ABORTED-STREAM'); // this executed
      });
      
    const fileImport = paramsFile.filename.split("/").reverse()[0];
    const dateImport = new Date().toLocaleString();

    // stream finshed so COPY
    Logs.debug("COPY TO ", paramsFile.tempTable);
    const scriptSql: string[] = [];
    const scriptSqlResult: string[] = [];
    // make import query
    Object.keys(paramsFile.columns).forEach(
      async (myColumn: string, index: number) => {
        const csvColumn: IcsvColumn = paramsFile.columns[myColumn];
        const valueSql = `json_build_object('value', CASE "${paramsFile.tempTable}".value${csvColumn.column} WHEN '---' THEN NULL ELSE cast(REPLACE(value${csvColumn.column},',','.') AS float) END)`;
        scriptSql.push(
          `${index == 0 ? "WITH" : ","} updated${
            index + 1
          } AS (INSERT into "${
            _DB.Observations.table
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
    return returnValue;
  }   
  return returnValue;
};


