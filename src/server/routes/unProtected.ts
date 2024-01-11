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
import { getRouteFromPath } from "./helpers";
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
export const unProtectedRoutes = new Router<DefaultState, Context>();
// ALl others
unProtectedRoutes.get("/(.*)", async (ctx) => {
  const adminWithSuperAdminAccess = isAdmin(ctx)
    ? isAllowedTo(ctx, EuserRights.SuperAdmin)
      ? true
      : false
    : true;
  let returnToBody: any = undefined;
  switch (getRouteFromPath(ctx.path).toUpperCase()) {    
    case `V${ctx._config.apiVersion}`:
      const expectedResponse: object[] = [];      
      if (isAdmin(ctx) && !adminWithSuperAdminAccess) ctx.throw(401);
        Object.keys(ctx._model)
        .filter((elem: string) => ctx._model[elem].order > 0)
        .sort((a, b) => (ctx._model[a].order > ctx._model[b].order ? 1 : -1))
        .forEach((value: string) => {
          expectedResponse.push({
            name: ctx._model[value].name,
            url: `${ctx._linkBase}/${versionString(ctx._config.apiVersion)}/${value}`,
          });
        });
      ctx.type = returnFormats.json.type;
      ctx.body = {
        value: expectedResponse.filter((elem) => Object.keys(elem).length),
      };
      break;

    case "ERROR":
      returnToBody = new CreateHtmlView(ctx);
      ctx.type = returnFormats.html.type;
      ctx.body = returnToBody.error("what ?");
      return;

    case "EXPORT":
      ctx.type = returnFormats.json.type;
      ctx.body = await exportService(ctx);
      return;

    case "REGISTER":
      returnToBody = new CreateHtmlView(ctx);
      ctx.type = returnFormats.html.type;
      ctx.body = returnToBody.login({ login: false });
      return;

    case "LOGOUT":
      ctx.cookies.set("jwt-session");
      if ( ctx.request.header.accept && ctx.request.header.accept.includes("text/html") )
        ctx.redirect(`${ctx._rootName}login`);
      else ctx.status = 200;
      ctx.body = {
        message: infos.logoutOk,
      };
      return;

    case "SQL":
      let sql = getUrlKey(ctx.request.url, "query");
      if (sql) {
        sql = atob(sql);
        const resultSql = await executeSql(sql.includes("log_request") ? serverConfig.getConfig(ADMIN) : ctx._config, sql);
        ctx.status = 201;
        ctx.body = [resultSql];
      }
      return;

    case "LOGIN":
      if (ensureAuthenticated(ctx)) ctx.redirect(`${ctx._rootName}status`);
      else {
        returnToBody = new CreateHtmlView(ctx);
        ctx.type = returnFormats.html.type;
        ctx.body = returnToBody.login({ login: true });
      }
      return;
    case "READY":
      const moi = {};
      serverConfig.getConfigs().flatMap(
        (e) => (moi[e] = serverConfig.getConfig(e).connection ? true : false)
      );
      ctx.type = returnFormats.json.type;
      ctx.body = {
        status: _READY,
        databases: moi,
      };
      return;

      case "DRAW":
        console.log(ctx._odata);
        ctx.type = returnFormats.xml.type;
        ctx.body = models.getDraw(ctx);
        return;

      case "INFOS":
        ctx.type = returnFormats.json.type;
        ctx.body = models.getInfos(ctx);
        return;

      
    case "STATUS":
      if (ensureAuthenticated(ctx)) {
        const user = await getAuthenticatedUser(ctx);
        if (user) {
          returnToBody = new CreateHtmlView(ctx);
          ctx.type = returnFormats.html.type;
          ctx.body = returnToBody.status(user);
          return;
        }
      }
      ctx.redirect(`${ctx._rootName}login`);
      return;

    case "REDORESULT":
      const step = getUrlId(ctx.url.toUpperCase());
      if (step) {
        returnToBody = await remadeResult(ctx, +step);
        if (returnToBody) {
          ctx.type = returnFormats.json.type;
          ctx.body = returnToBody;
        }
      }
      return;

    case "TOOL":
      returnToBody = await replayPayload();
      if (returnToBody) {
        ctx.type = returnFormats.json.type;
        ctx.body = returnToBody;
      }
      return;

    case "METRICS":
      returnToBody = getUrlKey(ctx.href, "query");
      if (returnToBody) {
        ctx.type = returnFormats.json.type;
        ctx.body = await getMetrics(returnToBody);
      }
      return;

    case "USER":
      // Only to get user Infos
      const id = getUrlId(ctx.url.toUpperCase());
      if (id && decodeToken(ctx)?.PDCUAS[EuserRights.SuperAdmin] === true) {
        const user = await userAccess.getSingle(id);
        returnToBody = new CreateHtmlView(ctx);
        ctx.type = returnFormats.html.type;
        ctx.body = returnToBody.userEdit({ body: user });
      } else ctx.throw(401);
      return;

    case "REDEMO":
      // create DB test
      console.log(formatLog.head("reDemo"));
      await serverConfig
        .getConnection(ADMIN)`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'demo';`
        .then(async () => {
          await serverConfig.getConnection(ADMIN)`DROP DATABASE IF EXISTS demo`;
          returnToBody = await createDatabase("demo");
          if (returnToBody) {
            ctx.status = 201;
            ctx.body = returnToBody;
          } else {
            ctx.status = 400;
            ctx.redirect(`${ctx._rootName}error`);
          }
        });
      return;
    case "DROP":
      // create DB test
      console.log(formatLog.head("drop database"));
      if (ctx._config.canDrop === true) {        
        const dbName = ctx._config.pg.database;
        // await ctx._config.db?.end();
        await executeAdmin(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname = ${addSimpleQuotes(dbName)}`).then(async () => {
            await executeAdmin(`DROP DATABASE IF EXISTS ${dbName}`);
            returnToBody = await createDatabase(dbName);
            if (returnToBody) {
              ctx.status = 201;
              ctx.body = returnToBody;
            } else {
              ctx.status = 400;
              ctx.redirect(`${ctx._rootName}error`);
            }
          });
      }
      return;
    case "REDOAGRHYS":
      // create DB test
      console.log(formatLog.head("redoAgrhys"));
      await serverConfig
        .getConnection(ADMIN)`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'agrhys';`
        .then(async () => {
          await serverConfig.getConnection(ADMIN)`DROP DATABASE IF EXISTS agrhys`;
          returnToBody = await createDatabase("agrhys");
          if (returnToBody) {
            ctx.status = 201;
            ctx.body = returnToBody;
          } else {
            ctx.status = 400;
            ctx.redirect(`${ctx._rootName}error`);
          }
        });
      return;
    case "CREATEDB":
      // create DB test
      console.log(formatLog.head("GET createDB"));
      returnToBody = await createDatabase(TEST);
      if (returnToBody) {
        ctx.status = 201;
        ctx.body = returnToBody;
      } else {
        ctx.status = 400;
        ctx.redirect(`${ctx._rootName}error`);
      }
      return;

    case "REMOVEDBTEST":
      // create DB test
      console.log(formatLog.head("GET remove DB test"));
      const returnDel = await serverConfig
        .getConnection(ADMIN)`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'test';`
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
        
      case "QUERY":        
        if (!adminWithSuperAdminAccess) ctx.redirect(`${ctx._rootName}login`);
        returnToBody = await createIqueryFromContext(ctx);
        ctx.set("script-src", "self");
        ctx.set("Content-Security-Policy", "self");
        ctx.type = returnFormats.html.type;
        ctx.body = createQueryHtml(returnToBody);
        return;      
  } // END Switch

  // API REQUEST  
  if (ctx.path.includes(`/${versionString(ctx._config.apiVersion)}`) || ctx._urlversion) {
    console.log(formatLog.head(`unProtected GET ${versionString(ctx._config.apiVersion)}`));
    const odataVisitor = await createOdata(ctx);    
    if (odataVisitor) ctx._odata = odataVisitor;
    if (ctx._odata) {
      if (ctx._odata.returnNull === true) { ctx.body = { values: [] }; return; }
      console.log(formatLog.head(`GET ${versionString(ctx._config.apiVersion)}`));
      const objectAccess = new apiAccess(ctx);
      if (objectAccess) {
        //API Root
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
        // Id requested
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

