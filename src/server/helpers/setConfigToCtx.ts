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
import { TEST, setDebug } from "../constants";
import { errors } from "../messages";
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

const getNameFromUrl = ( input: string, version?: string ): string | undefined => {
  version = version || getVersionFromUrl(input);
  return input
    .split(version)[0]
    .split("/")
    .filter((e: string) => e != "")[0];
};

export const setConfigToCtx = (ctx: koa.Context): void => {
  createBearerToken(ctx);
  setDebug(ctx.request.url.includes("$debug=true"));
  let configName = getConfigFromPort(ctx.req.socket.localPort);
  const version = getVersionFromUrl(ctx.originalUrl);
  const name = getNameFromUrl(ctx.originalUrl, version);
  
  if (!name) throw new Error(errors.noNameIdentified);
  if (name) {
    configName = configName || serverConfig.getConfigNameFromName(name);
    if (configName) ctx._config = serverConfig.getConfig(configName);
    else return;
    // else throw new Error(msg(errors.notPresentInConfigName, name));
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
      ? `proxy/${version}/`
      : `${ctx._linkBase}/${version}/`;

  ctx._model = models.filteredModelFromConfig(ctx._config);
};