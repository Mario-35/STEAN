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
        const tempUser = decodeToken(ctx); 
        ctx._user = tempUser ? tempUser :  {
            id: 0,
            username: "",
            password: "",
            PDCUAS: [false, false, false, false, false, false]
        };
        if (_debug === true) console.log(ConfigCtx(ctx));
        await next().then(async (res: any) => {            
            await writeToLog(ctx);
        });
    } catch (error: any) {
        if (error.message.includes("|")) {
            const temp = error.message.split("|");
            error.statusCode = +temp[0];
            error.message = temp[1];
            if(temp[2]) error.detai = temp[2];
        }    
        writeToLog(ctx, error);


        ctx.status = error.statusCode || error.status || 500;
        ctx.body = error.link
            ? {
                  code: error.statusCode,
                  message: error.message,
                  detail: error.detail,
                  link: error.link
              }
            : {
                  code: error.statusCode,
                  message: error.message,
                  detail: error.detail
              };
    }
};
