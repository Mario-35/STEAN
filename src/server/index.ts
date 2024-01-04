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
import { isTest } from "./helpers";
import serve from "koa-static";
import path from "path";
import { HELMET_CONFIG, APP_KEY, TEST, ADMIN, APP_NAME, APP_VERSION, _OK } from "./constants";
import { serverConfig } from "./configuration";
import { PgVisitor } from "./odata";
import { IconfigFile, Ientities, IKeyString, Ilog, IuserToken } from "./types";
import favicon from 'koa-favicon';
import { models } from "./models";
import { log } from "./log";

// Extend koa context (no ts test on it)
declare module "koa" {
  // Underscore to identify own context
  interface DefaultContext {
    _linkBase: string;
    _config: IconfigFile;
    _odata: PgVisitor;
    _datas: IKeyString;
    _user: IuserToken;
    _log: Ilog | undefined;
    _model: Ientities;
  }
}

// new koa server https://koajs.com/
export const app = new Koa();
app.use(favicon(__dirname + '/favicon.ico'));

// add public folder [static]
app.use(serve(path.join(__dirname, "/apidoc")));

// helmet protection https://github.com/venables/koa-helmet
app.use(helmet.contentSecurityPolicy({ directives: HELMET_CONFIG }));

// bodybarser https://github.com/koajs/bodyparser
app.use(bodyParser({ enableTypes: ["json", "text", "form"] }));

// router
app.use(routerHandle);

// logger https://github.com/koajs/logger
if (!isTest())
  app.use(logger((str) => process.stdout.write(`${new Date().toLocaleString()}${str + "\n"}`)));

// add json capabilities to KOA server
app.use(json());
// add cors capabilities to KOA server
app.use(cors());

// free routes
app.use(unProtectedRoutes.routes());

// app key
app.use((ctx, next) => {
  ctx.state.secret = APP_KEY;
  return next();
});

// authenticated routes
app.use(protectedRoutes.routes());

// Initialisation of models
models.init();
// Initialisation of custom logs
log.init();

// Start server initialisaion
export const server = isTest()
  ? app.listen(serverConfig.getConfig(TEST).port, async () => {
      await serverConfig.addToServer[ADMIN];
      serverConfig.createDbConnectionFromConfigName(TEST);
      console.log(log.message(`${APP_NAME} version : ${APP_VERSION}`, "ready " + _OK));
    })
  : serverConfig.init();
