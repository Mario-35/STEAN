/**
 * Helpers for user admin.
 *
 * @copyright 2020-present Inrae
 * @review 31-01-2024
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { getConfigFromPort } from ".";
import { serverConfig } from "../../configuration";
import { setDebug } from "../../constants";
import { EmodelType } from "../../enums";
import { cleanUrl } from "../../helpers";
import { formatLog } from "../../logger";
import { errors } from "../../messages";
import { IdecodedUrl  } from "../../types";


//   service root URI       resource path       query options
// __________|_________________ __|________________ ___|______________
//                             \                   \                  \
// http://example.org:8029/v1.1/Things(1)/Locations?$orderby=ID&$top=10
// _____/________________/____/___________________/___________________/
//   |           |         |              |                |
// protocol     host    version        pathname          search

export const decodeUrl =  (ctx: koa.Context, input?: string): IdecodedUrl | undefined => {
  console.log(formatLog.whereIam());
  // get input
  input = input || ctx.href;
  input = input;
  // debug mode
  setDebug(input.includes("?$debug=true") || input.includes("&$debug=true"));
  // decode url
  const url = new URL(cleanUrl(input.replace("$debug=true", "").normalize("NFD") .replace(/[\u0300-\u036f]/g, ""))); 
  // get configName from port    
  let configName = getConfigFromPort(+url.port);
  // split path
  // path[0] : service
  // path[1] : version
  // path[...] : path
  const paths = url.pathname.split('/').filter(e => e != "");  
  // no service
  if (paths[0]) 
    configName = configName || serverConfig.getConfigNameFromName(paths[0].toLowerCase());
    else throw new Error(errors.noNameIdentified);
  // get getLinkBase from service
  if (configName) {
    const LinkBase = serverConfig.getLinkBase(ctx, configName);
    let idStr: string | undefined = undefined;
    let id: string | 0 = 0;
    // if nothing ===> root
    let path = "/";
    // id string or number
    if (paths[2]) {
      id = (paths[2].includes("(")) ?  paths[2].split("(")[1].split(")")[0] : 0;
      idStr = (isNaN(+id)) ? String(id).toLocaleUpperCase() : undefined;
      path = paths.slice(2).join("/");
    }  
    // result
    return  {
      href: url.href, 
      protocol: url.protocol, 
      username: url.username,
      password: url.password,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      service: paths[0],
      version: paths[0] === "admin" ? EmodelType.v1_0 : paths[1],
      path: idStr ? path.replace(String(id), '0') : path,
      id: (isNaN(+id)) ? BigInt(0) : BigInt(id),
      idStr: idStr,
      config: configName,
      linkbase: LinkBase.linkBase,
      root: LinkBase.root,
      model: LinkBase.model
    }  
  }
  
}