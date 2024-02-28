/**
 * Index Routes.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import Koa from "koa";
import { decodeToken } from "../authentication";
import { versionString, _DEBUG } from "../constants";
import { log } from "../log";
import { formatLog, writeToLog } from "../logger";
import { EextensionsType } from "../enums";
import { createBearerToken, getUserId } from "../helpers";
import { decodeUrl } from "./helper";
import { errors } from "../messages";
import { serverConfig } from "../configuration";
import { models } from "../models";
export { protectedRoutes } from "./protected";
export { unProtectedRoutes } from "./unProtected";
import querystring from "querystring";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const routerHandle = async (ctx: Koa.Context, next: any) => { 
  // create token
  createBearerToken(ctx);
  const decodedUrl = decodeUrl(ctx);
 
  if (!decodedUrl) {
    // Gett all infos services
    if (ctx.path.toLocaleUpperCase() === "/INFOS") ctx.body = serverConfig.getAllInfos(ctx);
    return;
  };
  
  // set decodedUrl context
  ctx.decodedUrl = decodedUrl;
  if (_DEBUG) console.log(formatLog.object("decodedUrl", decodedUrl));

  if (!decodedUrl.service) throw new Error(errors.noNameIdentified);
  if (decodedUrl.service && decodedUrl.config) 
    ctx.config = serverConfig.getConfig(decodedUrl.config);
    else return;

  // forcing post loras with different version IT'S POSSIBLE BECAUSE COLUMN ARE THE SAME FOR ALL VERSION
  if (decodedUrl.version != versionString(ctx.config.apiVersion)) {
    if (!(ctx.request.method === "POST" && ctx.originalUrl.includes(`${decodedUrl.version}/Loras`)))
    ctx.redirect(ctx.request.method === "GET" 
      ? ctx.originalUrl.replace(decodedUrl.version, versionString(ctx.config.apiVersion))
      : `${ctx.decodedUrl.linkbase}/v${ctx.config.apiVersion}/`);
  }
  
  // try to clean query string
  ctx.querystring = decodeURIComponent(querystring.unescape(ctx.querystring));
  // prepare logs object
  try {
    if (ctx.config.extensions.includes(EextensionsType.logs))
      ctx.log = {
        datas: { ...ctx.request.body },
        code: -999,
        method: ctx.method,
        url: ctx.url,
        database: ctx.config.pg.database,
        user_id: getUserId(ctx).toString(),
      };
  } catch (error) {
    ctx.log = undefined;
  }
  // get model
  ctx.model = models.filteredModelFromConfig(ctx.config);
    try {
      // Init config context
      if (!ctx.config) return;    
      ctx.user = decodeToken(ctx);
      // Write in logs
      await next().then(async () => {      
        if (ctx.config.extensions.includes(EextensionsType.logs)) await writeToLog(ctx);
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
      if (ctx.config && ctx.config.extensions.includes(EextensionsType.logs))
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
