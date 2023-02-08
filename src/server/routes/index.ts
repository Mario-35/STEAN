/**
 * Index Logs.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import Koa from "koa";
import { setDebug, _debug } from "../constants";
import { ConfigCtx, setConfigToCtx } from "../helpers";
import { writeToLog } from "../logger";
import { decodeToken } from "../types/user";

export { protectedRoutes } from "./protected";
export { unProtectedRoutes } from "./unProtected";
export const routerHandle = async (ctx: Koa.Context, next: any) => {
    
    try {
        setDebug(ctx.request.url.includes("$debug=true"));
        ctx._addToLog = false;
        setConfigToCtx(ctx);
        const tempUser =  decodeToken(ctx); 
        ctx._user = tempUser ? tempUser :  {
            id: 0,
            username: "",
            password: "",
            PDCUAS: [false, false, false, false, false, false]
        };
        if (_debug === true) console.log(ConfigCtx(ctx));
        await next().then(async () => {
            await writeToLog(ctx);
        });
    } catch (err: any) {
        if (err.message.includes("|")) {
            const temp = err.message.split("|");
            err.statusCode = +temp[0];
            err.message = temp[1];
            if(temp[2]) err.detai = temp[2];
        }
        
        writeToLog(ctx, { "error": err.message + " : " + err.detail });


        ctx.status = err.statusCode || err.status || 500;
        ctx.body = err.link
            ? {
                  code: err.statusCode,
                  message: err.message,
                  detail: err.detail,
                  link: err.link
              }
            : {
                  code: err.statusCode,
                  message: err.message,
                  detail: err.detail
              };
    }
};
