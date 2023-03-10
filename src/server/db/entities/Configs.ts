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
import { _DBDATAS } from "../constants";
import { message } from "../../logger";
import { IReturnResult } from "../../types";
import { _CONFIGS, _CONFIGURATION } from "../../configuration";
import { hidePasswordInJson } from "../../helpers";
import { messages, messagesReplace } from "../../messages";

export class Configs extends Common {
     constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
         super(ctx, knexInstance);
     }

     async getAll(): Promise<IReturnResult | undefined> {
        message(true, "OVERRIDE", messagesReplace(messages.infos.classConstructor, [this.constructor.name, `getAll`]));    
        return this.createReturnResult({ body: hidePasswordInJson(this.ctx._configName === 'admin' ? _CONFIGS :_CONFIGS[this.ctx._configName]) });       
     }

     async add(dataInput: Object | undefined): Promise<IReturnResult | undefined> {
         message(true, "OVERRIDE", messagesReplace(messages.infos.classConstructor, [this.constructor.name, `add`]));    
         if (!dataInput) return;
         return this.createReturnResult({ body: await _CONFIGURATION.add(dataInput), });
    }

 }
 