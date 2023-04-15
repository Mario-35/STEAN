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
import { asyncForEach, isTest, logToFile } from "./helpers";
import { userToken } from "./types";
import serve from "koa-static";
import path from "path";
import compress from "koa-compress";
import { _HELMETCONFIG, _KEYAPP, _appVersion, _NODE_ENV, _appName } from "./constants";
import { _CONFIGS, _CONFIGURATION } from "./configuration";
import { PgVisitor } from "./odata";
import { messages } from "./messages";
import { _LOGS } from "./logger";

// Extend koa context (no ts test on it)
declare module "koa" {
    // Underscore to identify own context
    interface DefaultContext {
        _linkBase: string;
        _configName: string;
        _version: string;
        _odata: PgVisitor;
        _datas: {[key: string]: string};
        _user: userToken;
        _addToLog: boolean;
    }
}

// Add log To File
logToFile(false);

// new koa server https://koajs.com/
export const app = new Koa();

// add public folder [static]
app.use(serve(path.join(__dirname, "public")));

// helmet protection https://github.com/venables/koa-helmet
app.use(helmet.contentSecurityPolicy({ directives: _HELMETCONFIG }));

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
    ctx.state.secret = _KEYAPP;
    return next();
});

// authenticated routes
app.use(protectedRoutes.routes());

_LOGS.booting(`START ${_appName} version : ${_appVersion}`, `${new Date().toLocaleDateString()} : ${new Date().toLocaleTimeString()}`);
_LOGS.booting("mode", _NODE_ENV);

export const server = isTest()
    // Start listening Test
    ? app.listen(_CONFIGS["test"].port, async () => {
        _LOGS.booting(messages.infos.serverListening, _CONFIGS["test"].port);
      })
    : asyncForEach(
        // Start listening ALL in config file        
          Object.keys(_CONFIGS),
          async (key: string) => {  
            try {
                await _CONFIGURATION.addToServer(app, key);
            } catch (error) {
                console.log(error);                
            }          
          }
      );
