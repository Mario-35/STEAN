/**
 * writeToLog.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { formatLog } from ".";
import { addDoubleQuotes, hidePassword, isTest } from "../helpers";
import { executeSqlValues } from "../db/helpers";
import { models } from "../models";
import { log } from "../log";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const writeToLog = async ( ctx: koa.Context, ...error: any[] ): Promise<void> => {
  console.log(formatLog.whereIam());
  if (error.length > 0) formatLog.writeErrorInFile(ctx, error);  
  if (ctx._log && ctx._log.method != "GET") {
    ctx._log.code = error && error["code"] ? +error["code"] : +ctx.response.status;
    ctx._log.error = error;
    ctx._log.datas = hidePassword(ctx._log.datas); 
    try {
      if (ctx.body && ctx.body && typeof ctx.body === "string") ctx._log.returnid = JSON.parse(ctx.body)["@iot.id"];       
    } catch (error) {
      ctx._log.returnid = undefined;
    }   
    const code = Math.floor(ctx._log.code / 100);
    if (code == 2 || code == 3 )return;
    
    if (ctx._odata && ctx._odata.idLog && BigInt(ctx._odata.idLog) > 0 && code !== 2 ) return;
    await executeSqlValues(ctx._config, `INSERT INTO ${addDoubleQuotes(models.DBFull(ctx._config).Logs.table)} ${models.createInsertValues(ctx._config, ctx._log, models.DBFull(ctx._config).Logs.name)} returning id`).then((res: object) =>{
      if (!isTest()) console.log(formatLog.url(`${ctx._rootName}Logs(${res[0]})`));      
    }).catch((error) => {
      log.errorMsg(error);
    });
  }
};


