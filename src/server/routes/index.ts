/**
 * Index Logs.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import Koa from "koa";
import { boolToString, ConfigCtx, setConfigToCtx, stringToBool } from "../helpers";
import { addToLog, writeToLog } from "../logger";

export { protectedRoutes } from "./protected";
export { unProtectedRoutes } from "./unProtected";
export const makeRootName = (ctx: Koa.Context):string => `${ctx._linkBase}/${ctx._version}`;
export const routerHandle = async (ctx: Koa.Context, next: any) => {
    process.env.DEBUG = boolToString(ctx.request.url.includes("$debug=true"));
    try {
        // process.env.DEBUG = "true";
        setConfigToCtx(ctx);
        if (stringToBool(process.env.DEBUG)) console.log(ConfigCtx(ctx));
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
        
        addToLog(ctx, { "error": err.message + " : " + err.detail });

        await writeToLog(ctx);

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
