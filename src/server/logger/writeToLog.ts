/**
 * writeToLog.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

 import koa from "koa";
 import { getUserId } from "../helpers";
 import { logDebug } from ".";
 import { _CONFIGURATION } from "../configuration";
 import { _DBDATAS } from "../db/constants";
 import { db } from "../db";
 
 export const writeToLog = async (ctx: koa.Context, error?: Object): Promise<void> => {
     if (ctx._addToLog === true ) {  
         let id:BigInt | undefined = undefined
         
         if(ctx.request.body) try {
             id = <BigInt>ctx.request.body["logId"];            
         } catch (error) {
             id = undefined;
         }
 
         
     
         try { 
             if (id) {  
                 await db["admin"].table(_DBDATAS.Logs.table).update({"redo" : ctx.body}).where({id: id});
             }
             else {
                 const req = {
                     "method" : ctx.method,
                     "return" : ctx.body as string,
                     "code" : ctx.response.status,
                     "url" : ctx.url,
                     // "url" : ctx.url.split(ctx._version)[1],
                     "database" : ctx._configName,
                     "datas" : ctx.request.body as string,
                     "user_id" : getUserId(ctx).toString(),
                     "query" : ctx._query,
                     "error": error && error["error"]
                 }  
                 await db["admin"].table(_DBDATAS.Logs.table).insert(req);
             }
         } catch (error) {
             logDebug(error);
         }
     }
 };
 
 