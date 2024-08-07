/**
 * Unprotected Routes for API
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- Unprotected Routes for API -----------------------------------!");

import Router from "koa-router";
import { userAuthenticated, getAuthenticatedUser, } from "../authentication";
import { ADMIN, _READY } from "../constants";
import { addSimpleQuotes, getUrlKey, isAdmin, returnFormats } from "../helpers";
import { apiAccess } from "../db/dataAccess";
import { IreturnResult } from "../types";
import { createQueryHtml } from "../views/";
import { DefaultState, Context } from "koa";
import { createOdata } from "../odata";
import { infos } from "../messages";
import { serverConfig } from "../configuration";
import { createDatabase, testDatas } from "../db/createDb";
import { executeAdmin, executeSql, exportService } from "../db/helpers";
import { models } from "../models";
import { sqlStopDbName } from "./helper";
import { createService } from "../db/helpers";
import { HtmlError, Login, Status, Config } from "../views/";
import { createQueryParams } from "../views/helpers";
import { EFileName, EOptions } from "../enums";
import { getMetrics } from "../db/monitoring";
import { HtmlLogs } from "../views/class/logs";
import { log } from "../log";

export const unProtectedRoutes = new Router<DefaultState, Context>();
// ALl others
unProtectedRoutes.get("/(.*)", async (ctx) => {
  switch (ctx.decodedUrl.path.toUpperCase()) {  
    // Root path
    case `/`:
      ctx.body = models.getRoot(ctx);
      ctx.type = returnFormats.json.type;
      return;

    // metrics for moinoring
    case "METRICS":
      ctx.type = returnFormats.json.type;
      ctx.body = await getMetrics(ctx);
      return;
    // error show in html if query call
    case "ERROR":
      const bodyError = new HtmlError(ctx, "what ?");
      ctx.type = returnFormats.html.type;
      ctx.body = bodyError.toString();
      return;
    // logs
    case "LOGS":
      const bodyLogs = new HtmlLogs(ctx, "../../" + EFileName.logs);
      ctx.type = returnFormats.html.type;
      ctx.body = bodyLogs.toString();
      return;
    case "LOGSBAK":
      const bodyLogsBak = new HtmlLogs(ctx, "../../../" + EFileName.logsBak);
      ctx.type = returnFormats.html.type;
      ctx.body = bodyLogsBak.toString();
      return;
    // export service
    case "EXPORT":
      ctx.type = returnFormats.json.type;
      ctx.body = await exportService(ctx);
      return;
    // User login
    case "LOGIN":
      if (userAuthenticated(ctx)) ctx.redirect(`${ctx.decodedUrl.root}/status`);
      else {
        const bodyLogin = new Login(ctx,{ login: true });
        ctx.type = returnFormats.html.type;
        ctx.body = bodyLogin.toString();
      }
      return;
    // Status user 
    case "STATUS":      
      if (userAuthenticated(ctx)) {
        const user = await getAuthenticatedUser(ctx);
        if (user) {
          const bodyStatus = new Status(ctx, user);
          ctx.type = returnFormats.html.type;
          ctx.body = bodyStatus.toString();
          return;
        }
      }
      ctx.cookies.set("jwt-session");
      ctx.redirect(`${ctx.decodedUrl.root}/login`);
      return;
    // Create user 
    case "REGISTER":
      const bodyLogin = new Login(ctx, { login: false });
      ctx.type = returnFormats.html.type;
      ctx.body = bodyLogin.toString();
      return;
    // Logout user
    case "LOGOUT":
      ctx.cookies.set("jwt-session");
      if ( ctx.request.header.accept && ctx.request.header.accept.includes("text/html") )
        ctx.redirect(`${ctx.decodedUrl.root}/login`);
      else ctx.status = 200;
      ctx.body = {
        message: infos.logoutOk,
      };
      return; 
    // Execute Sql query pass in url 
    case "SQL":
      let sql = getUrlKey(ctx.request.url, "query");
      if (sql) {
        sql = atob(sql);
        const resultSql = await executeSql(sql.includes("log_request") ? serverConfig.getConfig(ADMIN) : ctx.config, sql);
        ctx.status = 201;
        ctx.body = [resultSql];
      }
      return;
    // Show draw.io model
    case "DRAW":
      ctx.type = returnFormats.xml.type;
      ctx.body = models.getDraw(ctx);
      return;
    // Infos and link of a services
    case "INFOS":
      ctx.type = returnFormats.json.type;
      ctx.body = await models.getInfos(ctx);
      return;
    case "INDEXES":
      process.exit(110);
    case "DROP":
      console.log(log.debug_head("drop database"));
      if (ctx.config.options.includes(EOptions.canDrop)) {        
        await executeAdmin(sqlStopDbName(addSimpleQuotes(ctx.config.pg.database))).then(async () => {
            await executeAdmin(`DROP DATABASE IF EXISTS ${ctx.config.pg.database}`);
            try {
              ctx.status = 201;
              ctx.body = await createDatabase(ctx.config.pg.database);              
            } catch (error) {
              ctx.status = 400;
              ctx.redirect(`${ctx.decodedUrl.root}/error`);
            }
          });
      }
      return;
    // Create DB test
    case "CREATEDBTEST":
      console.log(log.debug_head("GET createDB"));
      try {
        await serverConfig.connection(ADMIN)`DROP DATABASE IF EXISTS test`;
        ctx.body = await createService(testDatas),    
        ctx.status = 201;
      } catch (error) {
        ctx.status = 400;
        ctx.redirect(`${ctx.decodedUrl.root}/error`);
      }
      return;
    // Drop DB test
    case "REMOVEDBTEST":
      console.log(log.debug_head("GET remove DB test"));
      const returnDel = await serverConfig
        .connection(ADMIN)`${sqlStopDbName('test')}`
        .then(async () => {
          await serverConfig.connection(ADMIN)`DROP DATABASE IF EXISTS test`;
          return true;
        });
      if (returnDel) {
        ctx.status = 204;
        ctx.body = returnDel;
      } else {
        ctx.status = 400;
        ctx.redirect(`${ctx.decodedUrl.root}/error`);
      }
      return;
    // Return Query HTML Page Tool 
    case "QUERY":
      if (ctx.decodedUrl.service === ADMIN && isAdmin(ctx) === false) ctx.redirect(`${ctx.decodedUrl.root}/login`);
      const tempContext = await createQueryParams(ctx);       
      if (tempContext) {
        ctx.set("script-src", "self");
        ctx.set("Content-Security-Policy", "self");
        ctx.type = returnFormats.html.type;
        ctx.body = createQueryHtml(tempContext);
      }
      return;
    case "OPTIONS":
      const bodyEditConfig = new Config(ctx, { login: false, config: ctx.config, url: ctx.request.url });
      ctx.type = returnFormats.html.type;
      ctx.body = bodyEditConfig.toString();
      return;

    } // END Switch

  // API GET REQUEST  
  if (ctx.decodedUrl.path.includes(`/${ctx.config.apiVersion}`) || ctx.decodedUrl.version) {
    console.log(log.debug_head(`unProtected GET ${ctx.config.apiVersion}`));
    // decode odata url infos
    const odataVisitor = await createOdata(ctx);    
    
    if (odataVisitor) {
      ctx.odata = odataVisitor;
      if (ctx.odata.returnNull === true) { 
        ctx.body = { values: [] }; 
        return;
      }
      console.log(log.debug_head(`GET ${ctx.config.apiVersion}`));
      // Create api object
      const objectAccess = new apiAccess(ctx);
      if (objectAccess) {
        // Get all
        if (ctx.odata.entity && Number(ctx.odata.id) === 0) {
          const returnValue = await objectAccess.getAll();
          if (returnValue) {
            const datas = ctx.odata.returnFormat === returnFormats.json
                ? ({  "@iot.count": returnValue.id,
                      "@iot.nextLink": returnValue.nextLink,
                      "@iot.prevLink": returnValue.prevLink,
                      value: returnValue.body} as object)
                : returnValue.body;
            ctx.type = ctx.odata.returnFormat.type;
            ctx.body = ctx.odata.returnFormat.format(datas as object, ctx);
          } else ctx.throw(404);
        // Get One
        } else if ( (ctx.odata.id && typeof ctx.odata.id == "bigint" && ctx.odata.id > 0) || (typeof ctx.odata.id == "string" && ctx.odata.id != "") ) {
          const returnValue: IreturnResult | undefined = await objectAccess.getSingle(ctx.odata.id);
          if (returnValue && returnValue.body) {
            ctx.type = ctx.odata.returnFormat.type;
            ctx.body = ctx.odata.returnFormat.format(returnValue.body);
          } else ctx.throw(404, { detail: `id : ${ctx.odata.id} not found` });
        } else ctx.throw(400);
      }
    }
  }  
});

