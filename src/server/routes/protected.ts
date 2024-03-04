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
import koa from "koa";
import { formatLog } from "../logger";
import { IKeyString, IreturnResult, Iuser } from "../types";
import { DefaultState, Context } from "koa";
import { CreateHtmlView } from "../views/helpers/CreateHtmlView";
import { createIqueryFromContext } from "../views/helpers/";
import { createQueryHtml } from "../views/query";
import { createOdata } from "../odata";
import { errors, infos, msg } from "../messages";
import { EuserRights } from "../enums";
import { loginUser } from "../authentication";
import { ADMIN } from "../constants";
import { executeSqlValues } from "../db/helpers";
import { serverConfig } from "../configuration";
import { checkPassword, emailIsValid } from "./helper";

export const protectedRoutes = new Router<DefaultState, Context>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
protectedRoutes.post("/(.*)", async (ctx: koa.Context, next) => {
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
    // register html page or registration new user route
    case "REGISTER":
      const isObject = typeof ctx.request.body !== "string";
      const why: IKeyString = {};
      // Username
      if (isObject && ctx.request.body["username"].trim() === "") {
        why["username"] = msg(errors.empty, "username");
      } else {
        const user = await executeSqlValues(serverConfig.getConfig(ADMIN), `SELECT "username" FROM "user" WHERE username = '${ctx.request.body["username"]}' LIMIT 1`);
        if (user) why["username"] = errors.alreadyPresent;
      }
      // Email
      if (isObject && ctx.request.body["email"].trim() === "") {
        why["email"] = msg(errors.empty, "email");
      } else {
        if (emailIsValid(ctx.request.body["email"]) === false)
          why["email"] = msg(errors.invalid, "email");
      }
      // Password
      if (isObject && ctx.request.body["password"].trim() === "") {
        why["password"] = msg(errors.empty, "password");
      }
      // Repeat password
      if (isObject && (ctx.request.body["repeat"] as string).trim() === "") {
        why["repeat"] = msg(errors.empty, "repeat password");
      } else {
        if (ctx.request.body["password"] != ctx.request.body.repeat) {
          why["repeat"] = errors.passowrdDifferent;
        } else {
          if (checkPassword(ctx.request.body["password"]) === false)
            why["password"] = msg(errors.invalid, "password");
        }
      }

      if (Object.keys(why).length === 0) {
        try {
          await userAccess.post(ctx.config.name, ctx.request.body);
        } catch (error) {
          ctx.redirect(`${ctx.decodedUrl.root}/error`);
        }
      } else {
        const createHtml = new CreateHtmlView(ctx);
        ctx.type = returnFormats.html.type;
        ctx.body = createHtml.login({
          login: false,
          body: ctx.request.body,
          why: why,
        });
      }
      return;

    case "USER":
      const user = await userAccess.update(ctx.config.name, ctx.request.body);
      if (user) {
        ctx.login(user);
        ctx.redirect(`${ctx.decodedUrl.root}/admin`);
      } else {
        ctx.status = 400;
        ctx.redirect(`${ctx.decodedUrl.root}/error`);
      }
      return;
  }

  // Add new lora observation this is a special route without ahtorisatiaon to post (deveui and correct payload limit risks)
  if ((ctx.user && ctx.user.id > 0) || ctx.request.url.includes("/Lora")) {
    if (ctx.request.type.startsWith("application/json") && Object.keys(ctx.request.body).length > 0) {
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
    } else if (ctx.request.type.startsWith("multipart/form-data")) {
      // If upload datas
      const getDatas = async (): Promise<object> => {
        console.log(formatLog.head("getDatas ..."));
        return new Promise(async (resolve, reject) => {
          await upload(ctx)
            .then((data) => {
              resolve(data);
            })
            .catch((data) => {
              reject(data);
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
            const temp = await createIqueryFromContext(ctx);
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
    isAllowedTo(ctx, EuserRights.Post) === true &&
    Object.keys(ctx.request.body).length > 0
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
  if (isAllowedTo(ctx, EuserRights.Delete) === true) {
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
