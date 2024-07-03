/**
 * firstInstall
 *
 * @copyright 2020-present Inrae
 * @review 31-01-2024
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- firstInstall -----------------------------------!");

import { serverConfig } from "../../configuration";
import { returnFormats, unique } from "../../helpers";
import { koaContext, IdecodedUrl } from "../../types";
import { First } from "../../views";

export async function firstInstall(ctx: koaContext): Promise<IdecodedUrl | undefined>  {
  // If Configuration file Not exist first Install
  if (serverConfig.configFileExist() === false) {    
    // trap create post
    if (ctx.request.url.toUpperCase() === "/CREATE") {
      const src = JSON.parse(JSON.stringify(ctx.request.body, null, 2));      
      const ext: string[]= ["base"];
      const opt: string[]= [""];
      const extStr= "serviceextensions";
      const optStr= "serviceoptions";
      Object.keys(src).forEach((e: string) => {
        if (e.startsWith(extStr) && src[e] === "on") {
          ext.push(e.replace(extStr, ""))
          delete src[e];
        }
        if (e.startsWith(optStr) && src[e] === "on") {
          opt.push(e.replace(optStr, ""))
          delete src[e];
        }
      });
      src["extensions"] = unique(ext);
      src["options"] =  unique(opt);   
      src["serviceversion"] = src["serviceversion"].startsWith("v") ? src["serviceversion"].replace("v","") : src["serviceversion"];
      const confJson: Record<string, any> = {
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
            "apiVersion": src["serviceversion"],
            "date_format": "DD/MM/YYYY hh:mi:ss",
            "webSite": "no web site",
            "nb_page": 200,
            "alias": [ "" ],
            "options": [],
            "extensions": [ "base"]
        }
      };
      confJson[src["servicename"]] = {
        "name": src["servicename"],
        "port": 8029,
        "pg": {
            "host": src["servicehost"],
            "port": 5432,
            "user": src["serviceusername"],
            "password": src["servicepassword"],
            "database": src["servicedatabase"] || src["servicename"],
            "retry": 2
        },
        "apiVersion": src["serviceversion"],
        "date_format": "DD/MM/YYYY hh:mi:ss",
        "webSite": "",
        "nb_page": 200,
        "extensions": src["extensions"],
        "options": src["options"]
      }
      await serverConfig.init(JSON.stringify(confJson, null, 2)); 
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