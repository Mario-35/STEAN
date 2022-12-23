/**
 * Users entity.
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
import { addToConfig, _CONFIGFILE } from "../../configuration";
import { hidePasswordInJson } from "../../helpers";
import { db } from "../../db";
import { Rights } from "../../types/user";

 
 export class Users extends Common {
     constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
         super(ctx, knexInstance);
     }

     async getAll(): Promise<IReturnResult | undefined> {
        message(true, "CLASS", this.constructor.name, `getAll in ${this.ctx._odata.resultFormat} format`);
        if (this.ctx._user?.PDCUAS[Rights.SuperAdmin] === true || this.ctx._user?.PDCUAS[Rights.Admin] === true) {
            const temp = await db["admin"]
                .table("user")
                .select(Object.keys(_DBDATAS.Users.columns))
                .orderBy("id");
            
            hidePasswordInJson(temp);
            return this.createReturnResult({
                body: temp,
            });       
        } else this.ctx.throw(401);
     }

     async add(dataInput: Object | undefined): Promise<IReturnResult | undefined> {
        message(true, "OVERRIDE", this.constructor.name, "add");

        if (!dataInput) return;
        return this.createReturnResult({
            body: addToConfig(dataInput),
        });
    }



 }
 