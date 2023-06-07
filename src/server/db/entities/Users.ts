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
import { Logs } from "../../logger";
import { IreturnResult } from "../../types";
import { CONFIGURATION } from "../../configuration";
import { hidePasswordInJson } from "../../helpers";
import { messages } from "../../messages/";
import { EuserRights } from "../../enums";
import { _DBADMIN } from "../constants";
import { db } from "..";

 
 export class Users extends Common {
     constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
         super(ctx, knexInstance);
     }

     async getAll(): Promise<IreturnResult | undefined> {
        Logs.class(this.constructor.name, `getAll in ${this.ctx._odata.resultFormat} format`);
        if (this.ctx._user?.PDCUAS[EuserRights.SuperAdmin] === true || this.ctx._user?.PDCUAS[EuserRights.Admin] === true) {
            const temp = await db.admin
                .table("user")
                .select(Object.keys(_DBADMIN.Users.columns))
                .orderBy("id");
            
            hidePasswordInJson(temp);
            return this.createReturnResult({
                body: temp,
            });       
        } else this.ctx.throw(401, { code: 401, detail: messages.errors[401] });
     }

     async add(dataInput: object | undefined): Promise<IreturnResult | undefined> {
        Logs.override(this.constructor.name, "add");

        if (!dataInput) return;
        return this.createReturnResult({
            body: await CONFIGURATION.add(dataInput),
        });
    }

 }
 