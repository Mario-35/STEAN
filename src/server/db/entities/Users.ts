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
import { IReturnResult, MODES, USERRIGHTS } from "../../types";
import { _CONFIGURATION } from "../../configuration";
import { hidePasswordInJson } from "../../helpers";
import { db } from "..";
import { messages } from "../../messages/";

 
 export class Users extends Common {
     constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
         super(ctx, knexInstance);
     }

     async getAll(): Promise<IReturnResult | undefined> {
        message(true, MODES.CLASS, this.constructor.name, `getAll in ${this.ctx._odata.resultFormat} format`);
        if (this.ctx._user?.PDCUAS[USERRIGHTS.SuperAdmin] === true || this.ctx._user?.PDCUAS[USERRIGHTS.Admin] === true) {
            const temp = await db["admin"]
                .table("user")
                .select(Object.keys(_DBDATAS.Users.columns))
                .orderBy("id");
            
            hidePasswordInJson(temp);
            return this.createReturnResult({
                body: temp,
            });       
        } else this.ctx.throw(401, { code: 401,  detail: messages.errors[401] });
     }

     async add(dataInput: Object | undefined): Promise<IReturnResult | undefined> {
        message(true, MODES.OVERRIDE, this.constructor.name, "add");

        if (!dataInput) return;
        return this.createReturnResult({
            body: await _CONFIGURATION.add(dataInput),
        });
    }

 }
 