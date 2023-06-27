/**
 * getconfigCtx.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { serverConfig } from "../configuration";
import querystring from "querystring";
import cookieModule from "cookie";
import cookieParser from "cookie-parser";
import { APP_KEY, API_VERSION, TEST, setDebug } from "../constants";
import { messages, messagesReplace } from "../messages";
import { isTest } from ".";

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
const getVersionFromUrl = (input: string) => input .replace(/[//]+/g, "/") .split("/") .filter((value: string) => value.match(/v{1}\d\.\d/g))[0] || API_VERSION;

const getConfigFromPort = (port: number | undefined): string | undefined => {
    if (port) {
        const databaseName = isTest() ? [TEST] : Object.keys(serverConfig.configs).filter((word) => (word != "test" && serverConfig.configs[word].port) == port);
        if (databaseName && databaseName.length === 1) return databaseName[0];
    }
};

const getNameFromUrl = (input: string, version?: string): string | undefined => {
    version = version || getVersionFromUrl(input);
    return input.split(version)[0].split("/").filter((e: string) => e != "")[0]; 
};

const getConfigNameFromName = (name: string): string | undefined => {
    if (name) {
        const databaseName = isTest() ? "test" : Object.keys(serverConfig.configs).includes(name) ? name: undefined;
        if (databaseName) return databaseName;
        let aliasName: undefined | string = undefined;
        Object.keys(serverConfig.configs).forEach((configName: string) => { if(serverConfig.configs[configName].alias.includes(name)) aliasName = configName;});        
        if (aliasName) return aliasName;
    }
};

export const setConfigToCtx = (ctx: koa.Context): void => {
    bearerToken(ctx);
    setDebug(ctx.request.url.includes("$debug=true"));
    ctx._addToLog = false;
    let configName = getConfigFromPort(ctx.req.socket.localPort);            
    const version = getVersionFromUrl(ctx.originalUrl);
    const name = getNameFromUrl(ctx.originalUrl, version);
    if (!name) throw new Error(messages.errors.noConfigName);
    if (name) {
        configName = configName || getConfigNameFromName(name);
        if (configName) ctx._config = serverConfig.configs[configName];
        else throw new Error(messagesReplace(messages.errors.notPresentInConfigName, [name]));    
    }    

    ctx.querystring = decodeURIComponent(querystring.unescape(ctx.querystring));

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
    ctx._rootName = process.env.NODE_ENV?.trim() === "test" ? `proxy/${version}/` : `${ctx._linkBase}/${version}/`;
};
