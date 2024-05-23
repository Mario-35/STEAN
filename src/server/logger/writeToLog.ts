/**
 * writeToLog.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { formatLog } from ".";
import { addDoubleQuotes, hidePassword, isTest } from "../helpers";
import { executeSqlValues } from "../db/helpers";
import { models } from "../models";
import { log } from "../log";
import { createInsertValues } from "../models/helpers";
import { koaContext } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const writeToLog = async ( ctx: koaContext, ...error: any[] ): Promise<void> => {
  console.log(formatLog.whereIam("LOG"));
  if (error.length > 0) formatLog.writeErrorInFile(ctx, error);  
  if (ctx.log && ctx.log.method != "GET") {
    // @ts-ignore
    ctx.log.code = error && error["code"] ? +error["code"] : +ctx.response.status;
    ctx.log.error = error;
    ctx.log.datas = hidePassword(ctx.log.datas); 
    try {
      if (ctx.body && ctx.body && typeof ctx.body === "string") ctx.log.returnid = JSON.parse(ctx.body)["@iot.id"];       
    } catch (error) {
      ctx.log.returnid = undefined;
    }   
    const code = Math.floor(ctx.log.code / 100);
    if (code == 2 || code == 3 )return;
    
    // if (ctx.odata && ctx.odata.idLog && BigInt(ctx.odata.idLog) > 0 && code !== 2 ) return;
    await executeSqlValues(ctx.config, `INSERT INTO ${addDoubleQuotes(models.DBFull(ctx.config).Logs.table)} ${createInsertValues(ctx.config, ctx.log, models.DBFull(ctx.config).Logs.name)} returning id`).then((res: object) =>{
      // @ts-ignore
      if (!isTest()) console.log(formatLog.url(`${ctx.decodedUrl.root}/Logs(${res[0]})`));      
    }).catch((error) => {
      log.errorMsg(error);
    });
  }
};


