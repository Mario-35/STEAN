/**
 * setConfigToCtx.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { serverConfig } from "../configuration";
import querystring from "querystring";
import { TEST, setDebug, versionString } from "../constants";
import { errors, msg } from "../messages";
import { createBearerToken, getUserId, isTest } from ".";
import { models } from "../models";

const getVersionFromUrl = (input: string) =>
  input
    .replace(/[//]+/g, "/")
    .split("/")
    .filter((value: string) => value.match(/v{1}\d\.\d/g))[0];

const getConfigFromPort = (port: number | undefined): string | undefined => {
  if (port) {
    const databaseName = isTest()
      ? [TEST]
      : serverConfig.getConfigs().filter( (word) => (word != TEST && serverConfig.getConfig(word).port) == port );
    if (databaseName && databaseName.length === 1) return databaseName[0];
  }
};

export const getNameFromUrl = ( input: string, version?: string ): string | undefined => {
  version = version || getVersionFromUrl(input);
  return input
    .split(version)[0]
    .split("/")
    .filter((e: string) => e != "")
    .reverse()[0];
};

export const setConfigToCtx = (ctx: koa.Context): void => {
  createBearerToken(ctx);
  setDebug(ctx.request.url.includes("$debug=true"));
  let configName = getConfigFromPort(ctx.req.socket.localPort);
  const urlversion = getVersionFromUrl(ctx.originalUrl);
  const name = getNameFromUrl(ctx.originalUrl, urlversion);  
  if (!name) throw new Error(errors.noNameIdentified);
  if (name) {
    configName = configName || serverConfig.getConfigNameFromName(name);
    if (configName) ctx._config = serverConfig.getConfig(configName);
    else return;
    // else throw new Error(msg(errors.notPresentInConfigName, name));
  }

  // forcing post loras with different version 
  if (urlversion != versionString(ctx._config.apiVersion)) {
    if (ctx.request.method === "POST" && ctx.originalUrl.includes(`${urlversion}/Loras`)) ctx._urlversion = urlversion;
    
    // if (ctx.request.method === "POST" && ctx.originalUrl.endsWith("/Things")) 
    else throw new Error(msg(errors.wrongVersion, ctx._config.apiVersion));  
  }
  ctx.querystring = decodeURIComponent(querystring.unescape(ctx.querystring));
  try {
    if (ctx._config.extensions.includes("logs"))
      ctx._log = {
        datas: { ...ctx.request.body },
        code: -999,
        method: ctx.method,
        url: ctx.url,
        database: ctx._config.pg.database,
        user_id: getUserId(ctx).toString(),
      };
  } catch (error) {
    ctx._log = undefined;
  }
  const protocol = ctx.request.headers["x-forwarded-proto"]
    ? ctx.request.headers["x-forwarded-proto"]
    : ctx._config.forceHttps && ctx._config.forceHttps == true
    ? "https"
    : ctx.protocol;

  ctx._linkBase = ctx.request.headers["x-forwarded-host"]
    ? `${protocol}://${ctx.request.headers["x-forwarded-host"].toString()}`
    : ctx.request.header.host
    ? `${protocol}://${ctx.request.header.host}`
    : "";

  if (!ctx._linkBase.includes(name)) ctx._linkBase = ctx._linkBase + "/" + name;
  ctx._rootName =
    process.env.NODE_ENV?.trim() === "test"
      ? `proxy/${versionString(ctx._config.apiVersion)}/`
      : `${ctx._linkBase}/${versionString(ctx._config.apiVersion)}/`;

  ctx._model = models.filteredModelFromConfig(ctx._config);
};