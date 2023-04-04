/**
 * Protected Routes for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import Router from "koa-router";
import { apiAccess, userAccess } from "../db/dataAccess";
import { _DBDATAS } from "../db/constants";
import { returnFormats, upload } from "../helpers";
import fs from "fs";
import koa from "koa";
import { checkPassword, emailIsValid, testRoutes } from "./helpers";
import { message } from "../logger";
import { IReturnResult, MODES, USERRIGHTS } from "../types";
import { DefaultState, Context } from "koa";
import { CreateHtmlView } from "../views/helpers/CreateHtmlView";
import { loginUser } from "../types/user";
import { createIqueryFromContext } from "../views/helpers/";
import { queryHtmlPage } from "../views/query";
import { createOdata } from "../odata";
import { db } from "../db";
import { _CONFIGURATION } from "../configuration";
import { messages } from "../messages";
import { canDo } from ".";

export const protectedRoutes = new Router<DefaultState, Context>();

protectedRoutes.post("/(.*)", async (ctx: koa.Context, next) => {
    switch (testRoutes(ctx.path).toUpperCase()) {
        case "LOGIN":
            if (ctx.request["token"]) ctx.redirect(`${ctx._rootName}status`);
            await loginUser(ctx).then((user: any) => {
                if (user) {
                    ctx.status = 200;
                    if (ctx.request.header.accept && ctx.request.header.accept.includes("text/html")) ctx.redirect(`${ctx._rootName}Status`);
                    else
                        ctx.body = {
                            message: messages.infos.loginOk,
                            user: user.username,
                            token: user.token
                        };
                } else {
                    ctx.throw(401);
                }
            });
            return;

        case "REGISTER":
            const body = ctx.request.body;
            const isObject = typeof body != "string";
            const why: {[key: string]: string} = {};
            // Username
            if (isObject && body["username"].trim() === "") {
                why["username"] = messages.errors.emptyUsername;
            } else {
                const user = await db["admin"].table("user").select("username").where({ username: ctx.request.body["username"] }).first();
                if (user) why["username"] = messages.errors.alreadyPresent;
            }
            // Email
            if (isObject && body["email"].trim() === "") {
                why["email"] = messages.errors.emptyEmail;
            } else {
                if (emailIsValid(body["email"]) === false) why["email"] = messages.errors.invalidEmail;
            }
            // Password
            if (isObject && body["password"].trim() === "") {
                why["password"] = messages.errors.emptyPass;
            }
            // Repeat password
            if (isObject && (body["repeat"] as string).trim() === "") {
                why["repeat"] = messages.errors.emptyRepeatPass;
            } else {
                if (body["password"] != body.repeat) {
                    why["repeat"] = messages.errors.differentPass;
                } else {
                    if (checkPassword(body["password"]) === false) why["password"] = messages.errors.invalidPass;
                }
            }

            if (Object.keys(why).length === 0) {
                try {
                    await userAccess.add(ctx.request.body);
                } catch (error) {
                    ctx.redirect(`${ctx._rootName}error`);
                }
            } else {
                const createHtml = new CreateHtmlView(ctx);
                ctx.type = returnFormats.html.type;
                ctx.body = createHtml.login({   login: false, 
                                                body: ctx.request.body, 
                                                why: why});
            }
            return;

        case "USER":
            const user = await userAccess.update(ctx.request.body);
            if (user) {
                ctx.login(user);
                ctx.redirect(`${ctx._rootName}admin`);
            } else {
                ctx.status = 400;
                ctx.redirect(`${ctx._rootName}error`);
            }
            return;

    }

    if ((ctx._user && ctx._user.id > 0) || ctx.request.url.includes("/Lora")) {
        ctx._addToLog = true;
        if (ctx.request.type.startsWith("application/json") && Object.keys(ctx.request.body).length > 0) {
            const odataVisitor = await createOdata(ctx);         
            if (odataVisitor)  ctx._odata = odataVisitor;
            if (ctx._odata) {
                message(true, MODES.HEAD, "POST JSON");
                const objectAccess = new apiAccess(ctx);
                const returnValue: IReturnResult | undefined | void = await objectAccess.add();
                if (returnValue) {
                    returnFormats.json.type;
                    ctx.status = 201;
                    ctx.body = returnValue.body;
                }
            } else ctx.throw(400);
        } else if (ctx.request.type.startsWith("multipart/form-data")) {
            // If upload datas            
            const getDatas = async (): Promise<{[key: string]: string}> => {
                message(true, MODES.HEAD, "getDatas ...");
                return new Promise(async (resolve, reject) => {
                    await upload(ctx)
                        .then((data) => {
                            resolve(data);
                        })
                        .catch((data: any) => {
                            reject(data);
                        });
                });
            };

            ctx._datas = await getDatas();
            const odataVisitor = await createOdata(ctx); 
            if (odataVisitor)  ctx._odata = odataVisitor;
            if (ctx._odata) {
                message(true, MODES.HEAD, "POST FORM");
                const objectAccess = new apiAccess(ctx);
                const returnValue: IReturnResult | undefined | void = await objectAccess.add();                        
                if (ctx._datas) fs.unlinkSync(ctx._datas.file);
                if (returnValue) {
                    if (ctx._datas["source"] == "query") {
                        const temp = await createIqueryFromContext(ctx);
                        ctx.type = "html";
                        ctx.body = queryHtmlPage({
                            ...temp,
                            results: JSON.stringify({ added: returnValue.total, value: returnValue.body })
                        });
                    } else {
                        returnFormats.json.type;
                        ctx.status = 201;
                        ctx.body = returnValue.body ? returnValue.body : returnValue.body;
                    }
                } else {
                    ctx.throw(400);
                }
            }
        } else {
            // payload is malformed
            ctx.throw(400, { details: messages.errors.payloadIsMalformed });
        }
    } else {
        ctx.throw(401);
    }
});

protectedRoutes.patch("/(.*)", async (ctx) => {
    ctx._addToLog = true;
    if (canDo(ctx, USERRIGHTS.Post) === true && Object.keys(ctx.request.body).length > 0) {
        const odataVisitor = await createOdata(ctx); 
        if (odataVisitor)  ctx._odata = odataVisitor;
        if (ctx._odata) {
            message(true, MODES.HEAD, "PATCH");
            const objectAccess = new apiAccess(ctx);
            if (ctx._odata.id) {
                const returnValue: IReturnResult | undefined | void = await objectAccess.update(ctx._odata.id);
                if (returnValue) {
                    returnFormats.json.type;
                    ctx.status = 200;
                    ctx.body = returnValue.body;
                }
            } else {
                ctx.throw(400, { detail: messages.errors.idRequired });
            }
        } else {
            ctx.throw(404);
        }
    } else {
        ctx.throw(401);
    }
});

protectedRoutes.delete("/(.*)", async (ctx) => {
    ctx._addToLog = true;
    if (canDo(ctx, USERRIGHTS.Delete)  === true) {
        const odataVisitor = await createOdata(ctx); 
        if (odataVisitor)  ctx._odata = odataVisitor;
        if (ctx._odata) {
            message(true, MODES.HEAD, "DELETE");
            const objectAccess = new apiAccess(ctx);
            if (ctx._odata.id) {
                const returnValue: IReturnResult | undefined | void = await objectAccess.delete(ctx._odata.id);
                if (returnValue && returnValue.id && returnValue.id > 0) {
                    returnFormats.json.type;
                    ctx.status = 204;
                }
            } else {
                ctx.throw(400, { detail: messages.errors.idRequired });
            }
        } else {
            ctx.throw(404);
        }
    } else {
        ctx.throw(401);
    }
});
