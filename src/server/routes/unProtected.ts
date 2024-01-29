/**
 * Unprotected Routes for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import Router from "koa-router";
import { decodeToken, ensureAuthenticated, getAuthenticatedUser, } from "../authentication";
import { ADMIN, TEST, versionString, _READY } from "../constants";
import { addSimpleQuotes, getUrlId, getUrlKey, isAdmin, isAllowedTo, returnFormats } from "../helpers";
import { apiAccess, userAccess } from "../db/dataAccess";
import { formatLog } from "../logger";
import { IreturnResult } from "../types";
import { EuserRights } from "../enums";
import { createQueryHtml } from "../views/query";
import { CreateHtmlView, createIqueryFromContext } from "../views/helpers/";
import { getRouteFromPath, sqlStopDbName } from "./helpers";
import { DefaultState, Context } from "koa";
import { createOdata } from "../odata";
import { infos } from "../messages";
import { getMetrics } from "../db/monitoring";
import { serverConfig } from "../configuration";
import { createDatabase } from "../db/createDb";
import { remadeResult } from "../db/helpers/remadeResult";
import { replayPayload } from "../db/queries";
import { executeAdmin, executeSql, exportService } from "../db/helpers";
import { models } from "../models";
import { createService } from "../db/createDb";
export const unProtectedRoutes = new Router<DefaultState, Context>();
// ALl others
unProtectedRoutes.get("/(.*)", async (ctx) => {
  const adminWithSuperAdminAccess = isAdmin(ctx)
    ? isAllowedTo(ctx, EuserRights.SuperAdmin)
      ? true
      : false
    : true;
  switch (getRouteFromPath(ctx.path).toUpperCase()) {  
    // Root path  
    case `V${ctx._config.apiVersion}`:
      ctx.type = returnFormats.json.type;
      ctx.body = models.getRoot(ctx);
      break;
    // error show in html if query call
    case "ERROR":
      const bodyError = new CreateHtmlView(ctx);
      ctx.type = returnFormats.html.type;
      ctx.body = bodyError.error("what ?");
      return;
    // export service
    case "EXPORT":
      ctx.type = returnFormats.json.type;
      ctx.body = await exportService(ctx);
      return;
    // User login
    case "LOGIN":
      if (ensureAuthenticated(ctx)) ctx.redirect(`${ctx._rootName}status`);
      else {
        const bodyLogin = new CreateHtmlView(ctx);
        ctx.type = returnFormats.html.type;
        ctx.body = bodyLogin.login({ login: true });
      }
      return;
    // Status user 
    case "STATUS":
      if (ensureAuthenticated(ctx)) {
        const user = await getAuthenticatedUser(ctx);
        if (user) {
          const bodyStatus = new CreateHtmlView(ctx);
          ctx.type = returnFormats.html.type;
          ctx.body = bodyStatus.status(user);
          return;
        }
      }
      ctx.redirect(`${ctx._rootName}login`);
      return;
    // Create user 
    case "REGISTER":
      const bodyLogin = new CreateHtmlView(ctx);
      ctx.type = returnFormats.html.type;
      ctx.body = bodyLogin.login({ login: false });
      return;
    // Logout user
    case "LOGOUT":
      ctx.cookies.set("jwt-session");
      if ( ctx.request.header.accept && ctx.request.header.accept.includes("text/html") )
        ctx.redirect(`${ctx._rootName}login`);
      else ctx.status = 200;
      ctx.body = {
        message: infos.logoutOk,
      };
      return;
    // Only to get user Infos
    case "USER":
      const id = getUrlId(ctx.url.toUpperCase());
      if (id && decodeToken(ctx)?.PDCUAS[EuserRights.SuperAdmin] === true) {
        const user = await userAccess.getSingle(id);
        const bodyUuerEdit = new CreateHtmlView(ctx);
        ctx.type = returnFormats.html.type;
        ctx.body = bodyUuerEdit.userEdit({ body: user });
      } else ctx.throw(401);
      return;      
    // Execute Sql query pass in url 
    case "SQL":
      let sql = getUrlKey(ctx.request.url, "query");
      if (sql) {
        sql = atob(sql);
        const resultSql = await executeSql(sql.includes("log_request") ? serverConfig.getConfig(ADMIN) : ctx._config, sql);
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
    case "READY":
      createService(ctx);
      ctx.type = returnFormats.json.type;
      ctx.body = models.getInfos(ctx);
      return;
    case "INFOS":
      ctx.type = returnFormats.json.type;
      ctx.body = models.getInfos(ctx);
      return;
    // TODO REMOVE
    case "REDORESULT":
      const step = getUrlId(ctx.url.toUpperCase());
      if (step) {
        const tempResult = await remadeResult(ctx, +step);
        if (tempResult) {
          ctx.type = returnFormats.json.type;
          ctx.body = tempResult;
        }
      }
      return;
    // TODO REMOVE
    case "TOOL":
        ctx.type = returnFormats.json.type;
        ctx.body = replayPayload();
      return;

    case "METRICS":
      const tempUrlKey = getUrlKey(ctx.href, "query");
      if (tempUrlKey) {
        ctx.type = returnFormats.json.type;
        ctx.body = await getMetrics(tempUrlKey);
      }
      return;
    case "REDOAGRHYS": // TODO REMOVE
    case "DROP":
      // create DB test
      console.log(formatLog.head("drop database"));
      if (ctx._config.canDrop === true) {        
        const dbName = getRouteFromPath(ctx.path).toUpperCase() == "REDOAGRHYS" ? "agrhys" : ctx._config.pg.database;
        await executeAdmin(sqlStopDbName(addSimpleQuotes(dbName))).then(async () => {
            await executeAdmin(`DROP DATABASE IF EXISTS ${dbName}`);
            try {
              ctx.status = 201;
              ctx.body = await createDatabase(dbName);              
            } catch (error) {
              ctx.status = 400;
              ctx.redirect(`${ctx._rootName}error`);
            }
          });
      }
      return;
    // Create DB test
    case "CREATEDB":
      console.log(formatLog.head("GET createDB"));
      try {
        ctx.status = 201;
        ctx.body = await createDatabase(TEST);        
      } catch (error) {
        ctx.status = 400;
        ctx.redirect(`${ctx._rootName}error`);
      }
      return;
    // Drop DB test
    case "REMOVEDBTEST":
      console.log(formatLog.head("GET remove DB test"));
      const returnDel = await serverConfig
        .getConnection(ADMIN)`${sqlStopDbName('test')}`
        .then(async () => {
          await serverConfig.getConnection(ADMIN)`DROP DATABASE IF EXISTS test`;
          return true;
        });
      if (returnDel) {
        ctx.status = 204;
        ctx.body = returnDel;
      } else {
        ctx.status = 400;
        ctx.redirect(`${ctx._rootName}error`);
      }
      return;
    // Return Query HTML Page Tool    
    case "QUERY":        
      if (!adminWithSuperAdminAccess) ctx.redirect(`${ctx._rootName}login`);
      const tempContext = await createIqueryFromContext(ctx);
      ctx.set("script-src", "self");
      ctx.set("Content-Security-Policy", "self");
      ctx.type = returnFormats.html.type;
      ctx.body = createQueryHtml(tempContext);
      return;      
  } // END Switch

  // API GET REQUEST  
  if (ctx.path.includes(`/${versionString(ctx._config.apiVersion)}`) || ctx._urlversion) {
    console.log(formatLog.head(`unProtected GET ${versionString(ctx._config.apiVersion)}`));
    // decode odata url infos
    const odataVisitor = await createOdata(ctx);    
    if (odataVisitor) {
      ctx._odata = odataVisitor;
      if (ctx._odata.returnNull === true) { 
        ctx.body = { values: [] }; 
        return;
      }
      console.log(formatLog.head(`GET ${versionString(ctx._config.apiVersion)}`));
      // Create api object
      const objectAccess = new apiAccess(ctx);
      if (objectAccess) {
        // Get all
        if (ctx._odata.entity && Number(ctx._odata.id) === 0) {
          const returnValue = await objectAccess.getAll();
          if (returnValue) {
            const datas =
              ctx._odata.resultFormat === returnFormats.json
                ? ({
                    "@iot.count": returnValue.id,
                    "@iot.nextLink": returnValue.nextLink,
                    "@iot.prevLink": returnValue.prevLink,
                    value: returnValue.body,
                  } as object)
                : returnValue.body;
            ctx.type = ctx._odata.resultFormat.type;
            ctx.body = ctx._odata.resultFormat.format(datas as object, ctx);
          } else ctx.throw(404);
        // Get One
        } else if ( (ctx._odata.id && typeof ctx._odata.id == "bigint" && ctx._odata.id > 0) || (typeof ctx._odata.id == "string" && ctx._odata.id != "") ) {
          const returnValue: IreturnResult | undefined = await objectAccess.getSingle(ctx._odata.id);
          if (returnValue && returnValue.body) {
            ctx.type = ctx._odata.resultFormat.type;
            ctx.body = ctx._odata.resultFormat.format(returnValue.body);
          } else ctx.throw(404, { detail: `id : ${ctx._odata.id} not found` });
        } else ctx.throw(400);
      }
    }
  }  
});

