/**
 * CreateObservations entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Common } from "./common";
import { formatLog } from "../../logger";
import { IcsvColumn, IcsvFile, IreturnResult, IstreamInfos } from "../../types";
import { queryInsertFromCsv, dateToDateWithTimeZone, executeSql, executeSqlValues } from "../helpers";
import { asyncForEach } from "../../helpers";
import { errors, msg } from "../../messages/";
import { EdatesType, EextensionsType } from "../../enums";
import util from "util";
import { _NOTOK, _OK } from "../../constants";
import { models } from "../../models";
import { log } from "../../log";

// TODOCLEAN

export class CreateObservations extends Common {
  public indexResult = -1;
  constructor(ctx: koa.Context) {
    super(ctx);
  }

  createListColumnsValues( type: "COLUMNS" | "VALUES", input: string[] ): string[] {
    const res: string[] = [];
    const separateur = type === "COLUMNS" ? '"' : "'";
    input.forEach((elem: string, index: number) => {
      switch (elem) {
        case "result":
          this.indexResult = index + 1;
          break;
        case "FeatureOfInterest/id":
          elem = "featureofinterest_id";
          break;
      }
      res.push(
        isNaN(+elem)
          ? Array.isArray(elem)
            ? `'{"value": [${elem}]}'`
            : typeof elem === "string"
            ? elem.endsWith("Z")
              ? `TO_TIMESTAMP('${dateToDateWithTimeZone(elem)}', '${ EdatesType.dateWithOutTimeZone }')::TIMESTAMP`
              : `${separateur}${elem}${separateur}`
            : `${separateur}{${elem}}${separateur}`
          : index === this.indexResult && type === "VALUES"
          ? this.ctx.config.extensions.includes(EextensionsType.numeric)
            ? elem
            : `'{"value": ${elem}}'`
          : elem
      );
    });
    return res;
  }

  // Bad request
  async getAll(): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    this.ctx.throw(400, { code: 400 });
  }
  
  // Bad request
  async getSingle( idInput: bigint | string ): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam(idInput));
    this.ctx.throw(400, { code: 400 });
  }
  
  async post(dataInput: JSON): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    const returnValue: string[] = [];
    let total = 0;
    // verify is there FORM data    
    if (this.ctx.datas) {      
      const datasJson = JSON.parse(this.ctx.datas["datas"]);
      if (!datasJson["columns"]) this.ctx.throw(404, { code: 404, detail: errors.noColumn });
      const myColumns: IcsvColumn[] = [];
      const streamInfos: IstreamInfos[] = [];
      await asyncForEach(
        Object.keys(datasJson["columns"]),
        async (key: string) => {
          const tempStreamInfos = await models.getStreamInfos( this.ctx.config, datasJson["columns"][key] as JSON );
          if (tempStreamInfos) {
            streamInfos.push(tempStreamInfos);
            myColumns.push({ column: key, stream: tempStreamInfos, });
          } else this.ctx.throw( 404, msg( errors.noValidStream, util.inspect(datasJson["columns"][key], { showHidden: false, depth: null, colors: false, }) ) );
        }
      );

      const paramsFile: IcsvFile = {
        tempTable: `temp${Date.now().toString()}`,
        filename: this.ctx.datas["file"],
        columns: myColumns,
        header: datasJson["header"] && datasJson["header"] == true ? ", HEADER" : "",
        stream: streamInfos,
      };
      // stream file in temp table and get query to insert
      const sqlInsert = await queryInsertFromCsv(this.ctx, paramsFile);
      
      console.log(formatLog.debug(`stream csv file ${paramsFile.filename} in PostgreSql`, sqlInsert ? _OK : _NOTOK));
      if (sqlInsert) {
        const sqls = sqlInsert.query.map((e: string, index: number) => `${index === 0 ? 'WITH ' :', '}updated${index+1} as (${e})\n`)
        await executeSql(this.ctx.config, ['ALTER TABLE "historical_observation" SET UNLOGGED', 'ALTER TABLE observation SET UNLOGGED', 'ALTER TABLE observation DISABLE TRIGGER ALL']);
        const resultSql = await executeSql(this.ctx.config, `${sqls.join("")}\nSELECT (SELECT count(*) FROM ${paramsFile.tempTable}) AS total, (SELECT count(updated1) FROM updated1) AS inserted`).catch((error: Error) => { log.errorMsg(error) });
        await executeSql(this.ctx.config, ['ALTER TABLE observation SET LOGGED','ALTER TABLE "historical_observation" SET LOGGED','ALTER TABLE observation ENABLE TRIGGER ALL']);
          if (resultSql)  {
              console.log(formatLog.debug("SQL Executing", _OK));
              returnValue.push( `Add ${ resultSql[0] && resultSql[0]["inserted"] ? +resultSql[0]["inserted"] : 0 } observations from ${ paramsFile.filename.split("/").reverse()[0] }` );

              return this.createReturnResult({
                total: sqlInsert.count,
                body: returnValue,
              });
            }      
          }        
        return undefined;
    } else {
      /// classic Create      
      const dataStreamId = await models.getStreamInfos(this.ctx.config, dataInput);
      if (!dataStreamId)
        this.ctx.throw(404, { code: 404, detail: errors.noStream });
      else {
        await asyncForEach(dataInput["dataArray"], async (elem: string[]) => {
          const keys = [`"${dataStreamId.type?.toLowerCase()}_id"`].concat( this.createListColumnsValues( "COLUMNS", dataInput["components"] ) );
          const values = this.createListColumnsValues("VALUES", [ String(dataStreamId.id), ...elem, ]);
          await executeSqlValues(this.ctx.config, `INSERT INTO "observation" (${keys}) VALUES (${values}) RETURNING id`)
            .then((res: object) => {
              returnValue.push( this.linkBase.replace("Create", "") + "(" + res[0]+ ")" );
              total += 1;
            })
            .catch(async (error) => {
              if (error.code === "23505") {
                returnValue.push(`Duplicate (${elem})`);
                if ( dataInput["duplicate"] && dataInput["duplicate"].toUpperCase() === "DELETE" ) {
                  await executeSqlValues(this.ctx.config, `DELETE FROM "observation" WHERE 1=1 ` + keys .map((e, i) => `AND ${e} = ${values[i]}`) .join(" ") + ` RETURNING id` ) .then((res: object) => {
                    returnValue.push(`delete id ==> ${res[0]}`);
                      total += 1;
                    }).catch((error) => {
                      log.errorMsg(error);                     
                      formatLog.writeErrorInFile(undefined, error);
                    });
                }
              } else this.ctx.throw(400, { code: 400, detail: error });
            });
        });
        if (returnValue) {
          return this.createReturnResult({
            total: total,
            body: returnValue,
          });
        };
      }
    }
  }

  async update( idInput: bigint | string, dataInput: object | undefined ): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam(idInput || dataInput));
    this.ctx.throw(400, { code: 400 });
  }

  async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam(idInput));
    this.ctx.throw(400, { code: 400 });
  }
}
