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
import { hideKeysInJson } from "../../helpers";
import { ensureAuthenticated } from "../../authentication";

export class Configs extends Common {
     constructor(ctx: koa.Context) {
          super(ctx);
     }

     async getAll(): Promise<IreturnResult | undefined> {
         Logs.whereIam();     
         if (!ensureAuthenticated(this.ctx)) this.ctx.throw(401);
         const result: { [key: string]: IconfigFile; } = {};
         Object.keys(serverConfig.configs).filter(e => e != "admin").forEach((elem: string) => {
               result[elem] = {... serverConfig.configs[elem]};
         });
         return this.createReturnResult({ body: hideKeysInJson(result, ["entities"]) });       
     }

     async getSingle(idInput: bigint | string): Promise<IreturnResult | undefined> {
         Logs.whereIam();            
         if (!ensureAuthenticated(this.ctx)) this.ctx.throw(401);
         return this.createReturnResult({ body: hideKeysInJson(serverConfig.configs[typeof idInput === "string" ? idInput : this.ctx._config.name], ["entities"]) });       
    }


     async add(dataInput: object | undefined): Promise<IreturnResult | undefined> {
         Logs.whereIam(); 
         if (!ensureAuthenticated(this.ctx)) this.ctx.throw(401);
         if (dataInput) return this.createReturnResult({ body: await serverConfig.addConfig(dataInput)});
    }

 }
 