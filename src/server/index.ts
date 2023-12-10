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
import { HELMET_CONFIG, APP_KEY, TEST, ADMIN } from "./constants";
import { serverConfig } from "./configuration";
import { PgVisitor } from "./odata";
import { IconfigFile, IKeyString, Ilog, IuserToken } from "./types";
import { infos } from "./messages";
import { Logs } from "./logger";

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
  }
}

// new koa server https://koajs.com/
export const app = new Koa();

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
  app.use(logger((str) => console.log(`${new Date().toLocaleString()}${str}`)));

// add json capabilities to KOA server
app.use(json());
// add cors capabilities to KOA server
app.use(cors());

// free routes
app.use(unProtectedRoutes.routes());

app.use((ctx, next) => {
  ctx.state.secret = APP_KEY;
  return next();
});

// authenticated routes
app.use(protectedRoutes.routes());

export const server = isTest()
  ? app.listen(serverConfig.configs[TEST].port, async () => {
      serverConfig.addToServer[ADMIN];
      Logs.booting(false, infos.serverListening, serverConfig.configs[TEST].port);
      serverConfig.createDbConnectionFromConfigName(TEST);
    })
  : serverConfig.init();
