/**
 * Unprotected Routes for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import Router from "koa-router";
import { apiAccess, userAccess } from "../db/dataAccess";
import { DBDATAS } from "../db/constants";
import { configCtx, returnFormats } from "../helpers";
import fs from "fs";
import { db } from "../db";
import { Logs } from "../logger";
import { IreturnResult } from "../types";
import { EuserRights } from "../enums";
import { API_VERSION } from "../constants";
import { queryHtmlPage } from "../views/query";
import { CreateHtmlView, createIqueryFromContext, } from "../views/helpers/";
import { testRoutes } from "./helpers";
import { DefaultState, Context } from "koa";
import { createDatabase } from "../db/helpers";
import { createOdata } from "../odata";
import { messages } from "../messages";
import { isAdmin, canDo } from ".";
import { getMetrics } from "../db/monitoring";
import { CONFIGURATION } from "../configuration";
import { ensureAuthenticated, getAuthenticatedUser } from "../authentication";
export const unProtectedRoutes = new Router<DefaultState, Context>();

// ALl others
unProtectedRoutes.get("/(.*)", async (ctx) => {
    const adminWithSuperAdminAccess = isAdmin(ctx) ? canDo(ctx, EuserRights.SuperAdmin) ? true : false : true;

    switch (testRoutes(ctx.path).toUpperCase()) {
        case ctx._version.toUpperCase():
            const expectedResponse: object[] = [];
            if (isAdmin(ctx) && !adminWithSuperAdminAccess) ctx.throw(401);
            CONFIGURATION.list[ctx._configName].dbEntities
                .filter((elem: string) => isAdmin(ctx) ?DBDATAS[elem].admin === true : DBDATAS[elem].order > 0)
                .sort((a, b) => (DBDATAS[a].order > DBDATAS[b].order ? 1 : -1))
                .forEach((value: string) => {
                expectedResponse.push({
                    name: DBDATAS[value].name,
                    url: `${ctx._linkBase}/${ctx._version}/${value}`
                });
            }); 
            ctx.type = returnFormats.json.type;
            ctx.body = {
                value: expectedResponse.filter((elem) => Object.keys(elem).length)
            };
            break;

        case "FAVICON.ICO":
            try {
                const cacheControl = `public, max-age=${8640}`;
                ctx.set("Cache-Control", cacheControl);
                ctx.type = returnFormats.icon.type;
                ctx.body = fs.readFileSync(__dirname + "/favicon.ico");
            } catch (e) {
                if (e instanceof Error) Logs.error(e.message);
            }
            return;

        case "ERROR":
            const createHtmlError = new CreateHtmlView(ctx);
            ctx.type = returnFormats.html.type;
            ctx.body = createHtmlError.error("what ?");
            return;

        case "REGISTER":
            const createHtmlRegister = new CreateHtmlView(ctx);
            ctx.type = returnFormats.html.type;
            ctx.body = createHtmlRegister.login({ login: false });
            return;

        case "LOGOUT":
            ctx.cookies.set("jwt-session");
            if (ctx.request.header.accept && ctx.request.header.accept.includes("text/html")) ctx.redirect(`${ctx._rootName}login`);
            else ctx.status = 200;
            ctx.body = {
                message: messages.infos.logoutOk
            };
            return;

        case "SQL":
            const sql = atob(ctx.request.url.split("query=")[1]);   
            const resultSql = sql.includes("log_request") ? await db["admin"].raw(sql) : await db[ctx._configName].raw(sql);
            ctx.status = 201;
            ctx.body = resultSql.rows;
            return;

        case "LOGIN":
            if (ensureAuthenticated(ctx)) ctx.redirect(`${ctx._rootName}status`);
            else {
                const createHtml = new CreateHtmlView(ctx);
                ctx.type = returnFormats.html.type;
                ctx.body = createHtml.login({ login: true });
            }
            return;

        case "ALL":
            if (ctx.request["token"]?.PDCUAS[EuserRights.SuperAdmin] === true) {
                ctx.type = returnFormats.json.type;
                ctx.body = await userAccess.getAll();
            }
            return;

        case "INFOS":
            ctx.type = returnFormats.json.type;
            ctx.body = configCtx(ctx);
            return;

        case "STATUS":
            if (ensureAuthenticated(ctx)) {
                const user = await getAuthenticatedUser(ctx);
                if (user) {
                    const createHtml = new CreateHtmlView(ctx);
                    ctx.type = returnFormats.html.type;
                    ctx.body = createHtml.status(user);
                    return;
                }
            }
            ctx.redirect(`${ctx._rootName}login`);
            return;

        case "METRICS":            
            ctx.type = returnFormats.json.type;
            ctx.body = getMetrics();            
            return;

        case "QUERY":
            if(!adminWithSuperAdminAccess) ctx.redirect(`${ctx._rootName}login`);
            const temp = await createIqueryFromContext(ctx);
            ctx.set("script-src", "self");
            ctx.set("Content-Security-Policy", "self");
            ctx.type = returnFormats.html.type;
            ctx.body = queryHtmlPage(temp);
            return;

        case "USER":
            // Only to get user Infos
            const id = ctx.url.toUpperCase().match(/[0-9]/g)?.join("");
            if (id && ctx.request["token"]?.PDCUAS[EuserRights.SuperAdmin] === true) {
                const user = await userAccess.getSingle(id);
                const createHtml = new CreateHtmlView(ctx);
                ctx.type = returnFormats.html.type;
                ctx.body = createHtml.edit({ body: user });
            }
            return;

        case "CREATEDB":
            Logs.head("GET createDB");
            const returnValue = await createDatabase("test");

            if (returnValue) {
                ctx.status = 201;
                ctx.body = returnValue;
            } else {
                ctx.status = 400;
                ctx.redirect(`${ctx._rootName}error`);
            }
            return;
    }
    // API REQUEST
    if (ctx.path.includes(`/${API_VERSION}`)) {        
        const odataVisitor = await createOdata(ctx); 
        if (odataVisitor) ctx._odata = odataVisitor;
        if (ctx._odata) {
            Logs.head(`GET ${API_VERSION}`);
            const objectAccess = new apiAccess(ctx);
            if (objectAccess) {
                if (ctx._odata.entity && Number(ctx._odata.id) === 0) {
                    const returnValue = await objectAccess.getAll();                    
                    if (returnValue) {
                        const datas = ctx._odata.resultFormat === returnFormats.json ? {
                            "@iot.count": returnValue.id?.toString(),
                            "@iot.nextLink": returnValue.nextLink,
                            "@iot.prevLink": returnValue.prevLink,
                            value: returnValue.body
                        } as object : returnValue.body;
                        ctx.type = ctx._odata.resultFormat.type;
                        ctx.body = ctx._odata.resultFormat.format(datas as object, ctx);
                    } else ctx.throw(404);
                } else if ( (ctx._odata.id && typeof ctx._odata.id == "bigint" && ctx._odata.id > 0) || (typeof ctx._odata.id == "string" && ctx._odata.id != "") ) {
                    const returnValue: IreturnResult | undefined = await objectAccess.getSingle(ctx._odata.id);
                    if (returnValue && returnValue.body) {
                        ctx.type = ctx._odata.resultFormat.type;
                        ctx.body = ctx._odata.resultFormat.format(returnValue.body);
                    } else ctx.throw(404, { detail: `id : ${ctx._odata.id} not found` });
                } else ctx.throw(400);
            }
        } 
    } else {
        const createHtml = new CreateHtmlView(ctx);
        ctx.body = await createHtml.infos();
    }
});
