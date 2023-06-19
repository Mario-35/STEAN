/**
 * getconfigCtx.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { CONFIGURATION } from "../configuration";
import querystring from "querystring";
import cookieModule from "cookie";
import cookieParser from "cookie-parser";
import { APP_KEY, API_VERSION } from "../constants";
import { messages, messagesReplace } from "../messages";

/**
 *
 * @param ctx Koa context
 * @returns string or undefined
 */

const getCookie = (serializedCookies: string, key: string) => cookieModule.parse(serializedCookies)[key] ?? false;

const bearerToken = (ctx: koa.Context) => {
    const queryKey = "access_token";
    const bodyKey = "access_token";
    const headerKey = "Bearer";
    const cookie = true;

    if (cookie && !APP_KEY) {
        throw new Error(messages.errors.koaBearerToken);
    }

    const { body, header, query } = ctx.request;

    let count = 0;
    let token;

    if (query && query[queryKey]) {
        token = query[queryKey];
        count += 1;
    }

    if (body && body[bodyKey]) {
        token = body[bodyKey];
        count += 1;
    }

    if (header) {
        if (header.authorization) {
            const parts = header.authorization.split(" ");
            if (parts.length === 2 && parts[0] === headerKey) {
                [, token] = parts;
                count += 1;
            }
        }

        // cookie
        if (cookie && header.cookie) {
            const plainCookie = getCookie(header.cookie, "jwt-session"); // seeks the key
            if (plainCookie) {
                const cookieToken = cookieParser.signedCookie(plainCookie, APP_KEY);

                if (cookieToken) {
                    token = cookieToken;
                    count += 1;
                }
            }
        }
    }

    // RFC6750 states the access_token MUST NOT be provided
    // in more than one place in a single request.
    if (count > 1) {
        ctx.throw(400, "token_invalid", {
            message: messages.errors.tokenInvalid
        });
    }

    ctx.request["token"] = token;
};

export const setConfigToCtx = (ctx: koa.Context): void => {
    bearerToken(ctx);
    ctx._version =
        ctx.originalUrl
            .replace(/[//]+/g, "/")
            .split("/")
            .filter((value: string) => value.match(/v{1}\d\.\d/g))[0] || API_VERSION;

    const temp = CONFIGURATION.getConfigNameFromContext(ctx);

    if (!temp) throw new Error(messages.errors.noConfigName);    
    if (!CONFIGURATION.list[temp]) throw new Error(messagesReplace(messages.errors.notPresentInConfigName, [temp]));    

    ctx._configName = temp.trim().toLowerCase();

    ctx.querystring = decodeURIComponent(querystring.unescape(ctx.querystring));

    const protocol = ctx.request.headers["x-forwarded-proto"]
        ? ctx.request.headers["x-forwarded-proto"]
        : CONFIGURATION.list[ctx._configName].forceHttps && CONFIGURATION.list[ctx._configName].forceHttps == true
        ? "https"
        : ctx.protocol;

    ctx._linkBase = ctx.request.headers["x-forwarded-host"]
        ? `${protocol}://${ctx.request.headers["x-forwarded-host"].toString()}`
        : ctx.request.header.host
        ? `${protocol}://${ctx.request.header.host}`
        : "";

    if (!ctx._linkBase.includes(ctx._configName)) ctx._linkBase = ctx._linkBase + "/" + ctx._configName;
    ctx._rootName = process.env.NODE_ENV?.trim() === "test" ? `proxy/${ctx._version}/` : `${ctx._linkBase}/${ctx._version}/`;
};
