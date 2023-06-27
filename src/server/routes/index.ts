/**
 * Index Logs.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import Koa from "koa";
import { decodeToken } from "../authentication";
import { _debug } from "../constants";
import { EuserRights } from "../enums";
import { configCtx, setConfigToCtx } from "../helpers";
import { Logs, writeToLog } from "../logger";

export const isAdmin = (ctx: Koa.Context):boolean => ctx._config.name === "admin";
export const isAllowedTo = (ctx: Koa.Context, what: EuserRights):boolean => ctx._user.PDCUAS[what];


export { protectedRoutes } from "./protected";
export { unProtectedRoutes } from "./unProtected";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const routerHandle = async (ctx: Koa.Context, next: any) => {
    try {
        setConfigToCtx(ctx);
        
        const tempUser = decodeToken(ctx); 
        ctx._user = tempUser ? tempUser : {
            id: 0,
            username: "",
            password: "",
            PDCUAS: [false, false, false, false, false, false]
        };
        if (_debug === true) Logs.keys("configCtx", configCtx(ctx));
        await next().then(async () => {            
            await writeToLog(ctx);
        });
     // eslint-disable-next-line @typescript-eslint/no-explicit-any        
    } catch (error: any) {              
        if (error.message && error.message.includes("|")) {
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
