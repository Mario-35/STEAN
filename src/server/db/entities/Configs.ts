/**
 * Configs entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";
import koa from "koa";
import { Common } from "./common";
import { Logs } from "../../logger";
import { IreturnResult } from "../../types";
import { CONFIGURATION } from "../../configuration";
import { hidePasswordInJson } from "../../helpers";
import { messages, messagesReplace } from "../../messages";

export class Configs extends Common {
     constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
         super(ctx, knexInstance);
     }

     async getAll(): Promise<IreturnResult | undefined> {
        Logs.override(messagesReplace(messages.infos.classConstructor, [this.constructor.name, `getAll`]));    
        return this.createReturnResult({ body: hidePasswordInJson(this.ctx._configName === 'admin' ? CONFIGURATION.list :CONFIGURATION.list[this.ctx._configName]) });       
     }

     async add(dataInput: object | undefined): Promise<IreturnResult | undefined> {
         Logs.override(messagesReplace(messages.infos.classConstructor, [this.constructor.name, `add`]));    
         if (!dataInput) return;
         return this.createReturnResult({ body: await CONFIGURATION.add(dataInput), });
    }

 }
 