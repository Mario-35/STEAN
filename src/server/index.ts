/**
 * Index of The API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import helmet from "koa-helmet";
import json from "koa-json";
import { protectedRoutes, routerHandle, unProtectedRoutes } from "./routes/";
import cors from "@koa/cors";
import { asyncForEach, isTest } from "./helpers";
import { message } from "./logger";
import {  userToken } from "./types";
import serve from "koa-static";
import path from "path";
import compress from "koa-compress";
import { helmetConfig, keyApp, _ENV_VERSION, _NODE_ENV } from "./constants";
import { _DBDATAS } from "./db/constants";
import { _CONFIGFILE } from "./configuration";
import { PgVisitor } from "./odata";

declare module "koa" {
    // Underscore to identify own context
    interface DefaultContext  {
        _linkBase: string;
        _configName: string;
        _version: string;
        _odata: PgVisitor;
        _datas: {[key: string]: string};
        _query: string;
        _user: userToken
    }
}

export const app = new Koa();

app.use(serve(path.join(__dirname, "public")));

app.use(helmet.contentSecurityPolicy({ directives: helmetConfig }));

app.use(routerHandle);

app.use(bodyParser());

if (!isTest()) app.use(logger((str) => console.log(`${new Date().toLocaleString()}${str}`)));

app.use(json());
app.use(cors());

// minify and compress HTML
app.use(compress());

app.use(unProtectedRoutes.routes());

app.use((ctx, next) => {
    ctx.state.secret = keyApp;
    return next();
});

app.use(protectedRoutes.routes());

message(false, "HEAD", "env", _NODE_ENV);
message(false, "HEAD", "version", _ENV_VERSION);

export const server = isTest()
    ? app.listen(_CONFIGFILE.config["test"].port, async () => {
          message(false, "HEAD", "Server listening on port", _CONFIGFILE.config["test"].port);
      })
    : asyncForEach(
          Object.keys(_CONFIGFILE.config),
          async (key: string) => {            
              await _CONFIGFILE.addToServer(app, key);
          }
      );
