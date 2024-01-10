/**
 * showconfigCtx.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { IKeyString } from "../types";

/**
 *
 * @param ctx Koa context
 * @returns string or undefined
 */

export const configCtx = (ctx: koa.Context): IKeyString => {
  return {
    _linkBase: `"${ctx._linkBase}"`,
    name: `"${ctx._config.name}"`,
    _rootName: `"${ctx._rootName}"`,
    _urlversion: `"${ctx._urlversion}"`,
    method: `"${ctx.method}"`,
    url: `"${ctx.url}"`,
    originalUrl: `"${ctx.originalUrl}"`,
    origin: `"${ctx.origin}"`,
    href: `"${ctx.href}"`,
    path: `"${ctx.path}"`,
    querystring: `"${ctx.querystring}"`,
    host: `"${ctx.host}"`,
    hostname: `"${ctx.hostname}"`,
    fresh: `"${ctx.fresh}"`,
    stale: `"${ctx.stale}"`,
    socket: `"${ctx.socket}"`,
    protocol: `"${ctx.protocol}"`,
    secure: `"${ctx.secure}"`,
    ip: `"${ctx.ip}"`,
    ips: `"${ctx.ips}"`,
    subdomains: `"${ctx.subdomains}"`,
    "is()": `"${ctx.is()}"`,
    "accepts()": `"${ctx.accepts()}"`,
    "acceptsEncodings()": `"${ctx.acceptsEncodings()}"`,
    "acceptsCharsets()": `"${ctx.acceptsCharsets()}"`,
    "acceptsLanguages()": `"${ctx.acceptsLanguages()}"`,
  };
};
