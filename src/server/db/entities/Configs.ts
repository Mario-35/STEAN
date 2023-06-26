/**
 * Configs entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Common } from "./common";
import { Logs } from "../../logger";
import { IconfigFile, IreturnResult } from "../../types";
import { serverConfig } from "../../configuration";
import { hidePasswordInJson } from "../../helpers";
import { messages, messagesReplace } from "../../messages";
import { ensureAuthenticated } from "../../authentication";

export class Configs extends Common {
     constructor(ctx: koa.Context) {
          super(ctx);
     }
     boule(input: boolean):string {
        return (input === true) ? "TRUE" : "FALSE";
     }
     async getAll(): Promise<IreturnResult | undefined> {
        Logs.override(messagesReplace(messages.infos.classConstructor, [this.constructor.name, `getAll`]));    
        if (!ensureAuthenticated(this.ctx)) this.ctx.throw(401);
        const result: { [key: string]: IconfigFile; } = {};
        Object.keys(serverConfig.configs).filter(e => e != "admin").forEach((elem: string) => {
            result[elem] = serverConfig.configs[elem];
        });
        return this.createReturnResult({ body: hidePasswordInJson(result) });       
     }

     async getSingle(idInput: bigint | string): Promise<IreturnResult | undefined> {
         Logs.override(messagesReplace(messages.infos.classConstructor, [this.constructor.name, `getSingle`]));            
        if (!ensureAuthenticated(this.ctx)) this.ctx.throw(401);
        return this.createReturnResult({ body: hidePasswordInJson(serverConfig.configs[typeof idInput === "string" ? idInput : this.ctx._configName]) });       
    }


     async add(dataInput: object | undefined): Promise<IreturnResult | undefined> {
         Logs.override(messagesReplace(messages.infos.classConstructor, [this.constructor.name, `add`]));    
         console.log(dataInput);
         if (!dataInput) return;
         return this.createReturnResult({ body: await serverConfig.addConfig(dataInput), });
    }

 }
 