/**
 * Unprotected Routes for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import Router from "koa-router";
import { decodeToken, ensureAuthenticated, getAuthenticatedUser, } from "../authentication";
import { ADMIN, LOL, _READY } from "../constants";
import { addSimpleQuotes, getUrlId, getUrlKey, isAdmin, returnFormats } from "../helpers";
import { apiAccess, userAccess } from "../db/dataAccess";
import { formatLog } from "../logger";
import { IreturnResult } from "../types";
import { EnumUserRights } from "../enums";
import { createQueryHtml } from "../views/query";
import { CreateHtmlView, createIqueryFromContext } from "../views/helpers/";
import { DefaultState, Context } from "koa";
import { createOdata } from "../odata";
import { infos } from "../messages";
import { serverConfig } from "../configuration";
import { createDatabase, testDatas } from "../db/createDb";
import { executeAdmin, executeSql, exportService } from "../db/helpers";
import { models } from "../models";
import { sqlStopDbName } from "./helper";
import { createService } from "../db/helpers";

export const unProtectedRoutes = new Router<DefaultState, Context>();
// ALl others
unProtectedRoutes.get("/(.*)", async (ctx) => {
  switch (ctx.decodedUrl.path.toUpperCase()) {  
    // Root path
    case `/`:
      ctx.body = models.getRoot(ctx);
      ctx.type = returnFormats.json.type;
      return;
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
      if (ensureAuthenticated(ctx)) ctx.redirect(`${ctx.decodedUrl.root}/status`);
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
      ctx.redirect(`${ctx.decodedUrl.root}/login`);
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
        ctx.redirect(`${ctx.decodedUrl.root}/login`);
      else ctx.status = 200;
      ctx.body = {
        message: infos.logoutOk,
      };
      return;
    // Only to get user Infos
    case "USER":
      const id = getUrlId(ctx.url.toUpperCase());
      if (id && decodeToken(ctx)?.PDCUAS[EnumUserRights.SuperAdmin] === true) {
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
    case "READY":
      ctx.type = returnFormats.json.type;
      ctx.body = await models.getInfos(ctx);
      return;
    case "INFOS":
      ctx.type = returnFormats.json.type;
      ctx.body = await models.getInfos(ctx);
      return;
    case "REDOAGRHYS": // TODO REMOVE
    case "DROP":
      // create DB test
      console.log(formatLog.head("drop database"));
      if (ctx.config.canDrop === true || ctx.decodedUrl.path.toUpperCase() == "REDOAGRHYS") {        
        const dbName = ctx.decodedUrl.path.toUpperCase() == "REDOAGRHYS" ? "agrhys" : ctx.config.pg.database;
        await executeAdmin(sqlStopDbName(addSimpleQuotes(dbName))).then(async () => {
            await executeAdmin(`DROP DATABASE IF EXISTS ${dbName}`);
            try {
              ctx.status = 201;
              ctx.body = await createDatabase(dbName);              
            } catch (error) {
              ctx.status = 400;
              ctx.redirect(`${ctx.decodedUrl.root}/error`);
            }
          });
      }
      return;
    // Create DB test
    case "CREATEDBTEST":
      console.log(formatLog.head("GET createDB"));
      try {        
        ctx.body = await createService(testDatas),    
        ctx.status = 201;
      } catch (error) {
        ctx.status = 400;
        ctx.redirect(`${ctx.decodedUrl.root}/error`);
      }
      return;
    // Drop DB test
    case "REMOVEDBTEST":
      console.log(formatLog.head("GET remove DB test"));
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
      if (ctx.decodedUrl.service === "admin" && isAdmin(ctx) === false) ctx.redirect(`${ctx.decodedUrl.root}/login`);
      const tempContext = await createIqueryFromContext(ctx);    
      if (tempContext) {
        ctx.set("script-src", "self");
        ctx.set("Content-Security-Policy", "self");
        ctx.type = returnFormats.html.type;
        ctx.body = createQueryHtml(tempContext);
      }
      return;      
    case "TEST":
      const ent = models.DBAdmin(ctx.config);
      const myTest = {};
      Object.keys(ent).forEach(e => {
        const a = ent[e].table;
        const b = LOL(ent[e].singular);
        if (a != b) myTest[a] = b;
      })
      console.log(myTest);
      
        ctx.type = returnFormats.json.type;
        ctx.body = myTest;
      return;      
  } // END Switch

  // API GET REQUEST  
  if (ctx.decodedUrl.path.includes(`/${ctx.config.apiVersion}`) || ctx.decodedUrl.version) {
    console.log(formatLog.head(`unProtected GET ${ctx.config.apiVersion}`));
    // decode odata url infos
    const odataVisitor = await createOdata(ctx);    
    if (odataVisitor) {
      ctx.odata = odataVisitor;
      if (ctx.odata.returnNull === true) { 
        ctx.body = { values: [] }; 
        return;
      }
      console.log(formatLog.head(`GET ${ctx.config.apiVersion}`));
      // Create api object
      const objectAccess = new apiAccess(ctx);
      if (objectAccess) {
        // Get all
        if (ctx.odata.entity && Number(ctx.odata.id) === 0) {
          const returnValue = await objectAccess.getAll();
          if (returnValue) {
            const datas = ctx.odata.resultFormat === returnFormats.json
                ? ({
                    "@iot.count": returnValue.id,
                    "@iot.nextLink": returnValue.nextLink,
                    "@iot.prevLink": returnValue.prevLink,
                    value: returnValue.body,
                  } as object)
                : returnValue.body;
            ctx.type = ctx.odata.resultFormat.type;
            ctx.body = ctx.odata.resultFormat.format(datas as object, ctx);
          } else ctx.throw(404);
        // Get One
        } else if ( (ctx.odata.id && typeof ctx.odata.id == "bigint" && ctx.odata.id > 0) || (typeof ctx.odata.id == "string" && ctx.odata.id != "") ) {
          const returnValue: IreturnResult | undefined = await objectAccess.getSingle(ctx.odata.id);
          if (returnValue && returnValue.body) {
            ctx.type = ctx.odata.resultFormat.type;
            ctx.body = ctx.odata.resultFormat.format(returnValue.body);
          } else ctx.throw(404, { detail: `id : ${ctx.odata.id} not found` });
        } else ctx.throw(400);
      }
    }
  }  
});

