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
import serve from "koa-static";
import path from "path";
import compress from "koa-compress";
import { HELMET_CONFIG, APP_KEY, APP_VERSION, NODE_ENV, APP_NAME } from "./constants";
import { CONFIGURATION } from "./configuration";
import { PgVisitor } from "./odata";
import { messages } from "./messages";
import { Logs } from "./logger";
import { IuserToken } from "./types";

// Extend koa context (no ts test on it)
declare module "koa" {
    // Underscore to identify own context
    interface DefaultContext {
        _linkBase: string;
        _configName: string;
        _version: string;
        _odata: PgVisitor;
        _datas: {[key: string]: string};
        _user: IuserToken;
        _addToLog: boolean;
    }
}

// Add log To File


// new koa server https://koajs.com/
export const app = new Koa();

// add public folder [static]
app.use(serve(path.join(__dirname, "public")));

// helmet protection https://github.com/venables/koa-helmet
app.use(helmet.contentSecurityPolicy({ directives: HELMET_CONFIG }));

// router
app.use(routerHandle);

// bodybarser https://github.com/koajs/bodyparser
app.use(bodyParser({enableTypes: ['json', 'text', 'form']}));

// logger https://github.com/koajs/logger
if (!isTest()) app.use(logger((str) => console.log(`${new Date().toLocaleString()}${str}`)));

// add json capabilities to KOA server
app.use(json());
// add cors capabilities to KOA server
app.use(cors());

// minify and compress HTML https://github.com/koajs/compress
app.use(compress());

// free routes
app.use(unProtectedRoutes.routes());

app.use((ctx, next) => {
    ctx.state.secret = APP_KEY;
    return next();
});

// authenticated routes
app.use(protectedRoutes.routes());

Logs.booting(`START ${APP_NAME} version : ${APP_VERSION}`, `${new Date().toLocaleDateString()} : ${new Date().toLocaleTimeString()}`);
Logs.booting("mode", NODE_ENV);

export const server = isTest()
    // Start listening Test
    ? app.listen(CONFIGURATION.list["test"].port, async () => {
        Logs.booting(messages.infos.serverListening, CONFIGURATION.list["test"].port);
      })
    : asyncForEach(
        // Start listening ALL in config file        
          Object.keys(CONFIGURATION.list),
          async (key: string) => {  
            try {
                await CONFIGURATION.addToServer(app, key);
            } catch (error) {
                console.log(error);                
            }          
          }
      );
