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
import { IKeyValues, IReturnResult } from "../../types";
import { addToConfig, _CONFIGFILE } from "../../configuration";
import { hidePasswordInJson } from "../../helpers";

 
 export class Configs extends Common {
     constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
         super(ctx, knexInstance);
     }

     async getAll(): Promise<IReturnResult | undefined> {
        message(true, "CLASS", this.constructor.name, `getAll in ${this.ctx._odata.resultFormat} format`);

        const temp = this.ctx._configName === 'admin' ? _CONFIGFILE :_CONFIGFILE[this.ctx._configName];
        hidePasswordInJson(temp);
        
        return this.createReturnResult({
            body: temp,
        });       
     }

     async add(dataInput: IKeyValues[] | undefined): Promise<IReturnResult | undefined> {
        message(true, "OVERRIDE", this.constructor.name, "add");

        if (!dataInput) return;
        return this.createReturnResult({
            body: addToConfig(dataInput),
        });
    }



 }
 