/**
 * writeToLog.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
*
*/

import koa from "koa";
import { getUserId } from "../helpers";
import { Logs } from ".";
import { _DBADMIN } from "../db/constants";
import util from "util";
import { serverConfig } from "../configuration";
import { ADMIN } from "../constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const writeToLog = async (ctx: koa.Context, ...error: any[]): Promise<void> => {
    Logs.whereIam();    
    if (error.length > 0) Logs.writeError(ctx, error);    
    if (ctx._addToLog === true ) {
        try { 
            const req = {
                "method" : ctx.method,
                "code" : error && error["code"] ? +error["code"] : +ctx.response.status,
                "url" : ctx.url,
                "database" : ctx._config.pg.database,
                "datas" : typeof ctx.request.body && Object.keys(ctx.request.body).length === 0 ? ctx._datas : ctx.request.body as string,
                "user_id" : getUserId(ctx).toString(),
                "error": util.format.apply(null, error),
                "replayid": ctx._odata && ctx._odata.idLog && BigInt(ctx._odata.idLog) > 0 ? ctx._odata.idLog : undefined
            };  
            if (ctx.body) req["return"] = util.inspect(ctx.body, { showHidden: false, depth: null, colors: false });
            
            const code = Math.floor(req.code / 100);
            
            if (ctx._odata && ctx._odata.idLog && BigInt(ctx._odata.idLog) > 0 && code !== 2) return;
            
            Logs.debug("Write To logs", req);
            
            await serverConfig.db(ADMIN).table(_DBADMIN.Logs.table).insert(req).returning("id").then(async (res: object) => {                         
                if (code === 2 && ctx._odata.idLog && BigInt(ctx._odata.idLog) > 0 && res[0]) {  
                    await serverConfig.db(ADMIN).table(_DBADMIN.Logs.table).update({"entityid" : res[0]}).where({id: ctx._odata.idLog}).catch((error) => { Logs.writeError(ctx, error); });
                }
            }).catch((error) => {
                console.log(error);
                
            });
        } catch (error) {
            console.log(error);
        }
    }
};
