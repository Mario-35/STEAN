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
import { IReturnResult } from "../types";
import { DefaultState, Context } from "koa";
import { CreateHtmlView } from "../views/helpers/CreateHtmlView";
import { loginUser, userRights } from "../types/user";
import { createIqueryFromContext } from "../views/helpers/";
import { queryHtmlPage } from "../views/query";
import { redoLog } from "../db/helpers";
import { createOdata } from "../odata";
import { db } from "../db";
import { _CONFIGURATION } from "../configuration";

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
                            message: "login succeeded",
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
                why["username"] = "Empty username";
            } else {
                const user = await db["admin"].table("user").select("username").where({ username: ctx.request.body["username"] }).first();
                if (user) why["username"] = "Already present";
            }
            // Email
            if (isObject && body["email"].trim() === "") {
                why["email"] = "Empty email";
            } else {
                if (emailIsValid(body["email"]) === false) why["email"] = "Invalid email";
            }
            // Password
            if (isObject && body["password"].trim() === "") {
                why["password"] = "Empty password";
            }
            // Repeat password
            if (isObject && (body["repeat"] as string).trim() === "") {
                why["repeat"] = "Empty repeat password";
            } else {
                if (body["password"] != body.repeat) {
                    why["repeat"] = "Password are different";
                } else {
                    if (checkPassword(body["password"]) === false) why["password"] = "Invalid password";
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
                ctx.body = createHtml.login({ login: false, body: ctx.request.body, why: why });
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
        if (ctx.request.type.startsWith("application/json") && Object.keys(ctx.request.body).length > 0) {
            const odataVisitor = await createOdata(ctx);         
            if (odataVisitor)  ctx._odata = odataVisitor;
            if (ctx._odata) {
                message(true, "HEAD", "POST JSON");
                const objectAccess = new apiAccess(ctx);
                const returnValue: IReturnResult | undefined | void = await objectAccess.add();
                if (returnValue) {
                    returnFormats.json.type;
                    ctx.status = 201;
                    ctx.body = returnValue.body ? returnValue.body : returnValue.body;
                }
            } else ctx.throw(400);
        } else if (ctx.request.type.startsWith("multipart/form-data")) {
            // If upload datas
            const getDatas = async (): Promise<{[key: string]: string}> => {
                message(true, "HEAD", "getDatas ...");
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
                message(true, "HEAD", "POST FORM");
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
        } else if (ctx.url.includes(`${ctx._version}/Logs(`)){
            const odataVisitor = await createOdata(ctx);         
            if (odataVisitor)  ctx._odata = odataVisitor;
            if (ctx._odata) {
                redoLog(ctx, ctx._odata.id);
            } else   ctx.throw(400, { details: "Payload is malformed" });
        } else {
            // payload is malformed
            ctx.throw(400, { details: "Payload is malformed" });
        }
    } else {
        ctx.throw(401);
    }
});

protectedRoutes.patch("/(.*)", async (ctx) => {
    if (ctx._user.PDCUAS[userRights.Post] === true && Object.keys(ctx.request.body).length > 0) {
        const odataVisitor = await createOdata(ctx); 
        if (odataVisitor)  ctx._odata = odataVisitor;
        if (ctx._odata) {
            message(true, "HEAD", "PATCH");
            const objectAccess = new apiAccess(ctx);
            if (ctx._odata.id) {
                const returnValue: IReturnResult | undefined | void = await objectAccess.update(ctx._odata.id);
                if (returnValue) {
                    returnFormats.json.type;
                    ctx.status = 200;
                    ctx.body = returnValue.body;
                }
            } else {
                ctx.throw(400, { detail: "Id is required" });
            }
        } else {
            ctx.throw(404);
        }
    } else {
        ctx.throw(401);
    }
});

protectedRoutes.delete("/(.*)", async (ctx) => {
    if (ctx._user.PDCUAS[userRights.Delete] === true) {
        const odataVisitor = await createOdata(ctx); 
        if (odataVisitor)  ctx._odata = odataVisitor;
        if (ctx._odata) {
            message(true, "HEAD", "DELETE");
            const objectAccess = new apiAccess(ctx);
            if (ctx._odata.id) {
                const returnValue: IReturnResult | undefined | void = await objectAccess.delete(ctx._odata.id);
                if (returnValue && returnValue.id && returnValue.id > 0) {
                    returnFormats.json.type;
                    ctx.status = 204;
                }
            } else {
                ctx.throw(400, { detail: "Id is required" });
            }
        } else {
            ctx.throw(404);
        }
    } else {
        ctx.throw(401);
    }
});
