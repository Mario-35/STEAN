/**
 * queryInsertFromCsv.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { formatLog } from "../../logger";
import { IcsvColumn, IcsvFile } from "../../types";
import koa from "koa";
import { columnsNameFromHydrasCsv, streamCsvFile } from ".";
import { _NOTOK, _OK } from "../../constants";

export const queryInsertFromCsv = async ( ctx: koa.Context, paramsFile: IcsvFile ): Promise<{count: number, query: string[]} | undefined> => {
  console.log(formatLog.whereIam());
  const sqlRequest = await columnsNameFromHydrasCsv(paramsFile);
  if (sqlRequest) {
    const stream = await streamCsvFile(ctx, paramsFile, sqlRequest);
    console.log(formatLog.debug(`COPY TO ${paramsFile.tempTable}`, stream > 0 ? _OK : _NOTOK));
    if (stream > 0) {
      const fileImport = paramsFile.filename.split("/").reverse()[0];
      const dateImport = new Date().toLocaleString();
  
      // stream finshed so COPY
      const scriptSql: string[] = [];
      // make import query
      Object.keys(paramsFile.columns).forEach(
        (myColumn: string, index: number) => {
          const csvColumn: IcsvColumn = paramsFile.columns[myColumn];
          scriptSql.push(`INSERT INTO "${ ctx.model.Observations.table }" 
          ("${csvColumn.stream.type?.toLowerCase()}_id", "featureofinterest_id", "phenomenonTime", "resultTime", "result", "resultQuality")
            SELECT 
            ${csvColumn.stream.id}, 
            ${csvColumn.stream.FoId},  
            ${sqlRequest.dateSql}, 
            ${sqlRequest.dateSql},
            json_build_object('value', CASE "${paramsFile.tempTable}".value${csvColumn.column} WHEN '---' THEN NULL ELSE cast(REPLACE(value${csvColumn.column},',','.') AS float) END),
            '{"import": "${fileImport}","date": "${dateImport}"}'  
           FROM "${ paramsFile.tempTable }" ON CONFLICT DO NOTHING returning 1`);
        }
      );
      return {
        count: stream,
        query: scriptSql
      };
    }
  }
};

