/**
 * getConfigName.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { isTest } from ".";
import { _CONFIGS, _CONFIGURATION } from "../configuration";

/**
 *
 * @param ctx Koa context
 * @returns string or undefined
 */

export const getConfigName = (ctx: koa.Context): string | undefined => {
    const port = ctx.req.socket.localPort;
    if (port) {
        const databaseName = isTest() ? ["test"] : Object.keys(_CONFIGS).filter((word) => (word != "test" && _CONFIGS[word].port) == port);
        if (databaseName && databaseName.length === 1) return databaseName[0];
    }
    const name =  ctx.originalUrl.split(ctx._version)[0].split("/").filter((e: string) => e != "")[0]; 
           
    if (name) {
        const databaseName = isTest() ? "test" : Object.keys(_CONFIGS).includes(name) ? name: undefined;
        if (databaseName) return databaseName;
        let aliasName: undefined | string = undefined;
        Object.keys(_CONFIGS).forEach((configName: string) => { if(_CONFIGS[configName].alias.includes(name)) aliasName = configName});        
        if (aliasName) return aliasName;
        throw new Error(port ? `No configuration found for ${port} port or ${name} name` :`No configuration found for ${name} name`);
    }
    throw new Error(port ? `No configuration found for ${port} port or name missing` :`name missing`);
};
