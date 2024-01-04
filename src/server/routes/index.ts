/**
 * Index Logs.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import Koa from "koa";
import { decodeToken } from "../authentication";
import { _DEBUG } from "../constants";
import { log } from "../log";
import { configCtx, setConfigToCtx } from "../helpers";
import { formatLog, writeToLog } from "../logger";
export { protectedRoutes } from "./protected";
export { unProtectedRoutes } from "./unProtected";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const routerHandle = async (ctx: Koa.Context, next: any) => {
  try {
    setConfigToCtx(ctx);    
    if (!ctx._config) return;    
    const tempUser = decodeToken(ctx);
    ctx._user = tempUser
      ? tempUser
      : {
          id: 0,
          username: "",
          password: "",
          PDCUAS: [false, false, false, false, false, false],
        };
    if (_DEBUG) console.log(formatLog.object("configCtx", configCtx(ctx)));
    // Write in logs
    await next().then(async () => { 
      // if (ctx._config.extensions.includes("logs")) await writeToLog(ctx);
    });
  } catch (error: any) {    
    log.errorMsg(error);    
    if (error.message && error.message.includes("|")) {
      const temp = error.message.split("|");
      error.statusCode = +temp[0];
      error.message = temp[1];
      if (temp[2]) error.detai = temp[2];
    }
    if (ctx._config && ctx._config.extensions.includes("logs"))
      writeToLog(ctx, error);      
     const tempError = {
        code: error.statusCode,
        message: error.message,
        detail: error.detail,
      };
    ctx.status = error.statusCode || error.status || 500;
    ctx.body = error.link ? { ...tempError, link: error.link, } : tempError ;
  }
};
