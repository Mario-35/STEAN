/**
 * showconfigCtx.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";

/**
 *
 * @param ctx Koa context
 * @returns string or undefined
 */

import { logAll, logDebug } from "../logger";
import { _debug } from "../constants";

export const configCtx = (ctx: koa.Context): any => {
    return {
        "_linkBase": `${ctx._linkBase}`,
        "_configName": `${ctx._configName}`,
        "_rootName": `${ctx._rootName}`,
        "_version": `${ctx._version}`,
        "method": `${ctx.method}`,
        "url": `${ctx.url}`,
        "originalUrl": `${ctx.originalUrl}`,
        "origin": `${ctx.origin}`,
        "href": `${ctx.href}`,
        "path": `${ctx.path}`,
        "querystring": `${ctx.querystring}`,
        "host": `${ctx.host}`,
        "hostname": `${ctx.hostname}`,
        "fresh": `${ctx.fresh}`,
        "stale": `${ctx.stale}`,
        "socket": `${ctx.socket}`,
        "protocol": `${ctx.protocol}`,
        "secure": `${ctx.secure}`,
        "ip": `${ctx.ip}`,
        "ips": `${ctx.ips}`,
        "subdomains": `${ctx.subdomains}`,
        "is()": `${ctx.is()}`,
        "accepts()": `${ctx.accepts()}`,
        "acceptsEncodings()": `${ctx.acceptsEncodings()}`,
        "acceptsCharsets()": `${ctx.acceptsCharsets()}`,
        "acceptsLanguages()": `${ctx.acceptsLanguages()}`
    };
};

export const showconfigCtx = (ctx: koa.Context, force?: boolean): void => {
    if (_debug) logAll(ctx.request);
    const temp = configCtx(ctx);
    if (force) {
        console.log(temp);
    } else logDebug(temp);
};
