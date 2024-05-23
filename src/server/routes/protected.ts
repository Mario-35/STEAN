/**
 * Protected Routes for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import Router from "koa-router";
import { apiAccess, userAccess } from "../db/dataAccess";
import { isAllowedTo, returnFormats, upload } from "../helpers";
import fs from "fs";
import { formatLog } from "../logger";
import { IKeyString, IreturnResult, Iuser, koaContext } from "../types";
import { DefaultState, Context } from "koa";
import { createQueryHtml } from "../views/";
import { createOdata } from "../odata";
import { errors, infos, msg } from "../messages";
import { EnumUserRights } from "../enums";
import { loginUser } from "../authentication";
import { ADMIN } from "../constants";
import { executeSqlValues } from "../db/helpers";
import { serverConfig } from "../configuration";
import { checkPassword, emailIsValid } from "./helper";
import { Login } from "../views";
import { createQueryParams } from "../views/helpers";

export const protectedRoutes = new Router<DefaultState, Context>();

protectedRoutes.post("/(.*)", async (ctx: koaContext, next) => {  
  switch (ctx.decodedUrl.path.toUpperCase()) {
    // login html page or connection login
    case "LOGIN":      
      if (ctx.request["token"]) ctx.redirect(`${ctx.decodedUrl.root}/status`);
      await loginUser(ctx).then((user: Iuser | undefined) => {
        if (user) {
          ctx.status = 200;
          if ( ctx.request.header.accept && ctx.request.header.accept.includes("text/html") )
            ctx.redirect(`${ctx.decodedUrl.root}/Status`);
          else
            ctx.body = {
              message: infos.loginOk,
              user: user.username,
              token: user.token,
            };
        } else {
          ctx.throw(401);
        }
      });
      return;
    case "REGISTER":
      const why: IKeyString = {};
      // Username
      if (ctx.body["username"].trim() === "") {
        why["username"] = msg(errors.empty, "username");
      } else {
        const user = await executeSqlValues(serverConfig.getConfig(ADMIN), `SELECT "username" FROM "user" WHERE username = '${ctx.body["username"]}' LIMIT 1`);
        if (user) why["username"] = errors.alreadyPresent;
      }
      // Email
      if (ctx.body["email"].trim() === "") {
        why["email"] = msg(errors.empty, "email");
      } else {
        if (emailIsValid(ctx.body["email"]) === false)
          why["email"] = msg(errors.invalid, "email");
      }
      // Password
      if (ctx.body["password"].trim() === "") {
        why["password"] = msg(errors.empty, "password");
      }
      // Repeat password
      if ((ctx.body["repeat"] as string).trim() === "") {
        why["repeat"] = msg(errors.empty, "repeat password");
      } else {
        if (ctx.body["password"] != ctx.body.repeat) {
          why["repeat"] = errors.passowrdDifferent;
        } else {
          if (checkPassword(ctx.body["password"]) === false)
            why["password"] = msg(errors.invalid, "password");
        }
      }

      if (Object.keys(why).length === 0) {
        try {
          await userAccess.post(ctx.config.name, ctx.body);
        } catch (error) {
          ctx.redirect(`${ctx.decodedUrl.root}/error`);
        }
      } else {
        const createHtml = new Login(ctx, {
          login: false,
          body: ctx.request.body,
          why: why,
        });
        ctx.type = returnFormats.html.type;
        ctx.body = createHtml.toString();
      }
      return;
  }

  if(!ctx.decodedUrl.version && ctx.decodedUrl.path === "/" &&ctx.decodedUrl.service.toUpperCase() ==="CREATE") {
    // intercept create
    return;
  }
  
  // Add new lora observation this is a special route without ahtorisatiaon to post (deveui and correct payload limit risks)
  if ((ctx.user && ctx.user.id > 0) || ctx.config.users === false || ctx.request.url.includes("/Lora")) {
    if (ctx.request.type.startsWith("application/json") && Object.keys(ctx.body).length > 0) {
      const odataVisitor = await createOdata(ctx);
      if (odataVisitor) ctx.odata = odataVisitor;
      if (ctx.odata) {
        const objectAccess = new apiAccess(ctx);
        const returnValue: IreturnResult | undefined | void = await objectAccess.post();
        if (returnValue) {
          returnFormats.json.type;
          ctx.status = 201;
          ctx.body = returnValue.body;
        }
      } else ctx.throw(400);
    } else if (ctx.request.type.startsWith("multipart/")) {      
      // If upload datas
      const getDatas = async (): Promise<object> => {
        console.log(formatLog.head("getDatas ..."));
        return new Promise(async (resolve, reject) => {
          await upload(ctx)
            .then((data) => {
              resolve(data);
            })
            .catch((data) => {
              reject(data["state"] = "ERROR");
            });
        });
      };
      ctx.datas = await getDatas();
      
      const odataVisitor = await createOdata(ctx);
      if (odataVisitor) ctx.odata = odataVisitor;
      if (ctx.odata) {
        console.log(formatLog.head("POST FORM"));
        const objectAccess = new apiAccess(ctx);
        const returnValue = await objectAccess.post();
        if (ctx.datas) fs.unlinkSync(ctx.datas["file"]);
        if (returnValue) {
          if (ctx.datas["source"] == "query") {
            const temp = await createQueryParams(ctx);
            if (temp) {
              ctx.type = "html";
              ctx.body = createQueryHtml({
                ...temp,
                results: JSON.stringify({
                  added: returnValue.total,
                  value: returnValue.body,
                }),
              });
            }
          } else {
            returnFormats.json.type;
            ctx.status = 201;
            ctx.body = returnValue.body;
          }
        } else {
          ctx.throw(400);
        }
      }
    } else {
      // payload is malformed
      ctx.throw(400, { details: errors.payloadIsMalformed });
    }
  } else ctx.throw(401);
});

protectedRoutes.patch("/(.*)", async (ctx) => {
  if (
    isAllowedTo(ctx, EnumUserRights.Post) === true &&
    Object.keys(ctx.body).length > 0
  ) {
    const odataVisitor = await createOdata(ctx);
    if (odataVisitor) ctx.odata = odataVisitor;
    if (ctx.odata) {
      console.log(formatLog.head("PATCH"));
      const objectAccess = new apiAccess(ctx);
      if (ctx.odata.id) {
        const returnValue: IreturnResult | undefined | void =
          await objectAccess.update(ctx.odata.id);
        if (returnValue) {
          returnFormats.json.type;
          ctx.status = 200;
          ctx.body = returnValue.body;
        }
      } else {
        ctx.throw(400, { detail: errors.idRequired });
      }
    } else {
      ctx.throw(404);
    }
  } else {
    ctx.throw(401);
  }
});

protectedRoutes.delete("/(.*)", async (ctx) => {
  if (isAllowedTo(ctx, EnumUserRights.Delete) === true) {
    const odataVisitor = await createOdata(ctx);
    if (odataVisitor) ctx.odata = odataVisitor;
    if (ctx.odata) {
      console.log(formatLog.head("DELETE"));
      const objectAccess = new apiAccess(ctx);
      if (!ctx.odata.id) ctx.throw(400, { detail: errors.idRequired });
      const returnValue = await objectAccess.delete(ctx.odata.id);
      if (returnValue && returnValue.id && returnValue.id > 0) {
        returnFormats.json.type;
        ctx.status = 204;
      } else ctx.throw(404, { code: 404, detail: errors.noId + ctx.odata.id });
    } else {
      ctx.throw(404);
    }
  } else {
    ctx.throw(401);
  }
});
