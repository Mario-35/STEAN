/**
 * writeToLog.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- writeToLog. -----------------------------------!");
import { formatLog } from ".";
import { addDoubleQuotes, hidePassword, isTest } from "../helpers";
import { executeSqlValues } from "../db/helpers";
import { models } from "../models";
import { log } from "../log";
import { createInsertValues } from "../models/helpers";
import { keyobj, koaContext } from "../types";
import { _ID } from "../db/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const writeToLog = async ( ctx: koaContext, ...error: any[] ): Promise<void> => {
  console.log(formatLog.whereIam("LOG"));
  if (error.length > 0) formatLog.writeErrorInFile(ctx, error);  
  if (ctx.log && ctx.log.method != "GET") {
    ctx.log.code = error && error["code" as keyobj] ? +error["code" as keyobj] : +ctx.response.status;
    ctx.log.error = error;
    ctx.log.datas = hidePassword(ctx.log.datas); 
    try {
      if (ctx.body && ctx.body && typeof ctx.body === "string") ctx.log.returnid = JSON.parse(ctx.body)[_ID];       
    } catch (error) {
      ctx.log.returnid = undefined;
    }   
    const code = Math.floor(ctx.log.code / 100);
    if (code == 2 || code == 3 )return;
    
    await executeSqlValues(ctx.config, `INSERT INTO ${addDoubleQuotes(models.DBFull(ctx.config).Logs.table)} ${createInsertValues(ctx.config, ctx.log, models.DBFull(ctx.config).Logs.name)} returning id`).then((res: object) =>{
      if (!isTest()) console.log(formatLog.url(`${ctx.decodedUrl.root}/Logs(${res[0 as keyobj]})`));      
    }).catch((error) => {
      log.errorMsg(error);
    });
  }
};


