/**
 * writeToLog.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

 import koa from "koa";
 import { getUserId } from "../helpers";
 import { db } from "../db";
import { Logs } from ".";
import { _DBADMIN } from "../db/constants";
 
 export const writeToLog = async (ctx: koa.Context, error?: object): Promise<void> => {
    if (!ctx._addToLog == true ) return;
    try { 
        const req = {
            "method" : ctx.method,
            "return" : ctx.body as string,
            "code" : error && error["code"] ? +error["code"] : +ctx.response.status,
            "url" : ctx.url,
            "database" : ctx._configName,
            "datas" : ctx.request.body as string,
            "user_id" : getUserId(ctx).toString(),
            "error": error ? error["message"] + " : " + error["detail"] : "No Message",
            "replayid": ctx._odata.idLog && BigInt(ctx._odata.idLog) > 0 ? ctx._odata.idLog : undefined
        };  
        const code = Math.floor(req.code / 100);
        
        if (ctx._odata.idLog && BigInt(ctx._odata.idLog) > 0 && code !== 2) return;
        await db["admin"].table(_DBADMIN.Logs.table).insert(req).returning("id").then(async (res: object) => {                         
            if (code === 2 && ctx._odata.idLog && BigInt(ctx._odata.idLog) > 0 && res[0]) {  
                await db["admin"].table(_DBADMIN.Logs.table).update({"entityid" : res[0]}).where({id: ctx._odata.idLog});
            }
        }).catch((error) => {
            Logs.error(error);
        });
    } catch (error) {
        Logs.error(error);
    }
 };
 
 