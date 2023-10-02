/**
 * Unprotected Routes for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import Router from "koa-router";
import { apiAccess, userAccess } from "../db/dataAccess";
import { _DB } from "../db/constants";
import { getUrlId, getUrlKey, returnFormats } from "../helpers";
import fs from "fs";
import { Logs } from "../logger";
import { IreturnResult } from "../types";
import { EuserRights } from "../enums";
import { ADMIN, API_VERSION, TEST, _READY } from "../constants";
import { createQueryHtml } from "../views/query";
import { CreateHtmlView, createIqueryFromContext, } from "../views/helpers/";
import { isAdmin, isAllowedTo, testRoutes } from "./helpers";
import { DefaultState, Context } from "koa";
import { createOdata } from "../odata";
import { infos, } from "../messages";
import { getMetrics } from "../db/monitoring";
import { decodeToken, ensureAuthenticated, getAuthenticatedUser } from "../authentication";
import { createAdminHtml } from "../views/admin";
import { serverConfig } from "../configuration";
import { createDatabase } from "../db/createDb";
export const unProtectedRoutes = new Router<DefaultState, Context>();

// ALl others
unProtectedRoutes.get("/(.*)", async (ctx) => {
    const adminWithSuperAdminAccess = isAdmin(ctx) ? isAllowedTo(ctx, EuserRights.SuperAdmin) ? true : false : true;

    switch (testRoutes(ctx.path).toUpperCase()) {
        case ctx._config.apiVersion.toUpperCase():
            const expectedResponse: object[] = [];
            if (isAdmin(ctx) && !adminWithSuperAdminAccess) ctx.throw(401);            
            ctx._config.entities
                .filter((elem: string) => _DB[elem].order > 0)
                .sort((a, b) => (_DB[a].order > _DB[b].order ? 1 : -1))
                .forEach((value: string) => {
                expectedResponse.push({
                    name: _DB[value].name,
                    url: `${ctx._linkBase}/${ctx._config.apiVersion}/${value}`
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
                message: infos.logoutOk
            };
            return;

        case "SQL":
            let sql = getUrlKey(ctx.request.url, "query");   
            if (sql) {
                sql = atob(sql);
                const resultSql = sql.includes("log_request") ? await serverConfig.db(ADMIN).raw(sql) : await serverConfig.db(ctx._config.name).raw(sql);
                ctx.status = 201;
                ctx.body = resultSql.rows;
            }
            return;

        case "LOGIN":
            if (ensureAuthenticated(ctx)) ctx.redirect(`${ctx._rootName}status`);
            else {
                const createHtml = new CreateHtmlView(ctx);
                ctx.type = returnFormats.html.type;
                ctx.body = createHtml.login({ login: true });
            }
            return;
        case "READY":
            const moi = {};
            Object.keys(serverConfig.configs).flatMap(e => moi[e] = serverConfig.configs[e].db ? true : false);           
            ctx.type = returnFormats.json.type;
            ctx.body = {
                status : _READY,
                databases: moi
            };
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
            const query = getUrlKey(ctx.href, "query");                         
            if (query) {
                ctx.type = returnFormats.json.type;
                ctx.body = await getMetrics(query);         
            }
            return;             
            
        case "QUERY":
            if(!adminWithSuperAdminAccess) ctx.redirect(`${ctx._rootName}login`);
            const temp = await createIqueryFromContext(ctx);
            ctx.set("script-src", "self");
            ctx.set("Content-Security-Policy", "self");
            ctx.type = returnFormats.html.type;
            ctx.body = createQueryHtml(temp);
            return;
                
        case "ADMIN":
            if (ensureAuthenticated(ctx)) {     
                ctx.set("script-src", "self");
                ctx.set("Content-Security-Policy", "self");
                ctx.type = returnFormats.html.type;
                ctx.body = await createAdminHtml(ctx, true);
            } else ctx.redirect(`${ctx._rootName}login`);
            return; 

        case "USER":
            // Only to get user Infos
            const id = getUrlId(ctx.url.toUpperCase());                
            if (id && decodeToken(ctx)?.PDCUAS[EuserRights.SuperAdmin] === true) {                    
                const user = await userAccess.getSingle(id);                    
                const createHtml = new CreateHtmlView(ctx);
                ctx.type = returnFormats.html.type;
                ctx.body = createHtml.userEdit({ body: user });
            } else ctx.throw(401);
            return;
                
        case "CREATEDB":
            // create DB test 
            Logs.head("GET createDB");
            const returnValue = await createDatabase(TEST);                     
            if (returnValue) {
                ctx.status = 201;
                ctx.body = returnValue;
            } else {
                ctx.status = 400;
                ctx.redirect(`${ctx._rootName}error`);
            }
            return;

        case "REMOVEDBTEST":
            // create DB test 
            Logs.head("GET remove DB test");
            const returnDel = await serverConfig.db(ADMIN).raw(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'test';`).then(async () => {
                                                            await serverConfig.db(ADMIN).raw("DROP DATABASE IF EXISTS test");
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
    } // END Switch

    // API REQUEST
    if (ctx.path.includes(`/${API_VERSION}`)) {  
        Logs.head(`unProtected GET ${API_VERSION}`);
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
