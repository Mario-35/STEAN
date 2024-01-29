/**
 * Index Routes.
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
import { serverConfig } from "../configuration";
import { EextensionsType } from "../enums";
export { protectedRoutes } from "./protected";
export { unProtectedRoutes } from "./unProtected";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const routerHandle = async (ctx: Koa.Context, next: any) => {
  if (ctx.path.split("/").filter(e => e != "")[0] === "infos") {
    ctx.body = serverConfig.getAllInfos(ctx);
  } else {
    setConfigToCtx(ctx);
    try {
      // Init config context
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
        if (ctx._config.extensions.includes(EextensionsType.logs)) await writeToLog(ctx);
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {    
      log.errorMsg(error);    
      if (error.message && error.message.includes("|")) {
        const temp = error.message.split("|");
        error.statusCode = +temp[0];
        error.message = temp[1];
        if (temp[2]) error.detai = temp[2];
      }
      if (ctx._config && ctx._config.extensions.includes(EextensionsType.logs))
        writeToLog(ctx, error);      
       const tempError = {
          code: error.statusCode,
          message: error.message,
          detail: error.detail,
        };
      ctx.status = error.statusCode || error.status || 500;
      ctx.body = error.link ? { ...tempError, link: error.link, } : tempError ;
    }
  }
};
