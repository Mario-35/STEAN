/**
 * Index of The API
 *
 * @copyright 2020-present Inrae
 * @review 29-01-2024
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- Index of The API -----------------------------------!");

import path from "path";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import helmet from "koa-helmet";
import compress from "koa-compress";
import json from "koa-json";
import cors from "@koa/cors";
import serve from "koa-static";
import favicon from 'koa-favicon';
import { constants } from "zlib";
import { log } from "./log";
import { serverConfig } from "./configuration";
import { models } from "./models";
import { isTest, logToHtml } from "./helpers";
import { RootPgVisitor } from "./odata/visitor";
import { sqlStopDbName } from "./routes/helper";
import { EChar } from "./enums";
import { protectedRoutes, routerHandle, unProtectedRoutes } from "./routes/";
import { IconfigFile, IdecodedUrl, Ientities, Ilog, IuserToken, koaContext } from "./types";
import { HELMET_CONFIG, APP_KEY, TEST, APP_NAME, APP_VERSION, ADMIN } from "./constants";

// Extend koa context 
declare module "koa" {
  export interface DefaultContext {
    decodedUrl: IdecodedUrl;
    config: IconfigFile;
    odata: RootPgVisitor;
    datas: Record<string, any>;
    user: IuserToken;
    log: Ilog | undefined;
    model: Ientities;
    body: any;
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

app.use(compress({
  filter: function (content_type) {
    return ( /json/i.test(content_type) || /text/i.test(content_type)) },
    threshold: 1024,
    gzip: {
    flush: constants.Z_NO_FLUSH,
    level: constants.Z_BEST_COMPRESSION
  }}));

// router
app.use(routerHandle);

// logger https://github.com/koajs/logger
if (!isTest())
  app.use(logger((str) => {

    if(str.includes("/logs")) return;
    str = `[39m ${new Date().toLocaleString()}${str}`;
    process.stdout.write(str + "\n");
    if (serverConfig.logFile) serverConfig.logFile.write(logToHtml(str));
  }));

// add json capabilities to KOA server
app.use(json());
// add cors capabilities to KOA server
app.use(cors());

// free routes
app.use(unProtectedRoutes.routes());

// app key
app.use((ctx: koaContext, next) => {
  ctx.state.secret = APP_KEY;
  ctx.body = ctx.request.body;
  return next();
});

// authenticated routes
app.use(protectedRoutes.routes());

// Initialisation of models
models.init();

// Start server initialisaion
export const server = isTest()
  ? app.listen(serverConfig.getConfig(TEST).port, async () => {
    await serverConfig
          .connection(ADMIN)`${sqlStopDbName('test')}`
          .then(async () => {
            await serverConfig.connection(ADMIN)`DROP DATABASE IF EXISTS test`;
            process.stdout.write(`DROP DATABASE IF EXISTS test\n`);
          });
      console.log(log.message(`${APP_NAME} version : ${APP_VERSION}`, "ready " + EChar.ok));
    })
  : serverConfig.init();
