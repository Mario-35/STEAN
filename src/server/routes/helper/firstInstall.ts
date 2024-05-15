/**
 * firstInstall.
 *
 * @copyright 2020-present Inrae
 * @review 31-01-2024
 * @author mario.adam@inrae.fr
 *
 */

import { serverConfig } from "../../configuration";
import { returnFormats } from "../../helpers";
import { koaContext, IdecodedUrl } from "../../types";
import { First } from "../../views";

export function firstInstall(ctx: koaContext): IdecodedUrl | undefined  {
  // If Configuration file Not exist first Install
  if (serverConfig.configFileExist() === false) {    
    // trap create post
    if (ctx.request.url.toUpperCase() === "/CREATE") {
        const src = JSON.parse(JSON.stringify(ctx.request.body, null, 2));
    
        serverConfig.readConfigFile(JSON.stringify({
          "admin": {
              "name": "admin",
              "port": 8029,
              "pg": {
                  "host": src["host"],
                  "port": 5432,
                  "user": src["username"],
                  "password": src["password"],
                  "database": "postgres",
                  "retry": 2
              },
              "apiVersion": "1.1",
              "date_format": "DD/MM/YYYY hh:mi:ss",
              "webSite": "no web site",
              "nb_page": 200,
              "forceHttps": false,
              "alias": [ "" ],
              "extensions": [],
              "highPrecision": false,
              "canDrop": false,
              "logFile": ""
          }
        }, null, 2));
        serverConfig.init();
        // serverConfig.writeConfig();
        serverConfig.addConfig({
          "name": src["service"],
          "port": 8029,
          "pg": {
              "host": src["servicehost"],
              "port": 5432,
              "user": src["serviceusername"],
              "password": src["servicepassword"],
              "database": src["service"],
              "retry": 2
          },
          "apiVersion": "1.1",
          "date_format": "DD/MM/YYYY hh:mi:ss",
          "webSite": "",
          "nb_page": 200,
          "forceHttps": false,
          "extensions": [ "base"],
          "highPrecision": false,
          "canDrop": false,
          "logFile": ""
      });
    
    }
    // show first install screen
    else {
      const bodyFirst= new First(ctx, { login: false , url: ctx.request.url});
      ctx.type = returnFormats.html.type;
      ctx.body = bodyFirst.toString();
    }
    return;
  }
}