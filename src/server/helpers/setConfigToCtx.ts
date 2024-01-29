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
import { errors } from "../messages";
import { createBearerToken, getUserId, isTest } from ".";
import { models } from "../models";
import { EextensionsType } from "../enums";

/**
 * 
 * @param input url string
 * @returns extracted version in url
 */
const getVersionFromUrl = (input: string) =>
  input
    .replace(/[//]+/g, "/")
    .split("/")
    .filter((value: string) => value.match(/v{1}\d\.\d/g))[0];

/**
 * 
 * @param port of the request
 * @returns name of the configuration
 */
const getConfigFromPort = (port: number | undefined): string | undefined => {
  if (port) {
    const databaseName = isTest()
      ? [TEST]
      : serverConfig.getConfigs().filter( (word) => (word != TEST && serverConfig.getConfig(word).port) == port );
    if (databaseName && databaseName.length === 1) return databaseName[0];
  }
};

/**
 * 
 * @param input name of the configuration
 * @param version version if exist
 * @returns name of the configuration
 */
export const getNameFromUrl = ( input: string, version?: string ): string | undefined => {
  version = version || getVersionFromUrl(input);
  return input
    .split(version)[0]
    .split("/")
    .filter((e: string) => e != "")
    .reverse()[0];
};

/**
 * 
 * Intialise koa context
 * @param ctx koa context
 * @returns nothing
 */
export const setConfigToCtx = (ctx: koa.Context): void => {
  // create token
  createBearerToken(ctx);
  // is debug mode in url ?
  setDebug(ctx.request.url.includes("$debug=true"));
  // Get config name from port if exist
  let configName = getConfigFromPort(ctx.req.socket.localPort);
  // get version in url
  const urlversion = getVersionFromUrl(ctx.originalUrl);
  // get name service 
  const name = getNameFromUrl(ctx.originalUrl, urlversion);
  // If name not found exit
  if (!name) throw new Error(errors.noNameIdentified);
  if (name) {
    configName = configName || serverConfig.getConfigNameFromName(name);
    if (configName) ctx._config = serverConfig.getConfig(configName);
    else return;
  }

  const temp = serverConfig.getLinkBase(ctx, name);
  ctx._linkBase = temp.linkBase;
  ctx._rootName = temp.root

  // forcing post loras with different version IT'S POSSIBLE BECAUSE COLUMN ARE THE SAME FOR ALL VERSION
  if (urlversion != versionString(ctx._config.apiVersion)) {
    if (ctx.request.method === "POST" && ctx.originalUrl.includes(`${urlversion}/Loras`)) ctx._urlversion = urlversion;
    else ctx.redirect(`${ctx._linkBase}/${ctx._config.name}/v${ctx._config.apiVersion}/`);
  }
  // try to clean query string
  ctx.querystring = decodeURIComponent(querystring.unescape(ctx.querystring));
  // prepare logs object
  try {
    if (ctx._config.extensions.includes(EextensionsType.logs))
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
  // get model
  ctx._model = models.filteredModelFromConfig(ctx._config);
};