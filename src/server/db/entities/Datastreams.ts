/**
 * Datastreams entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";
import koa from "koa";
import { message } from "../../logger";
import { messages } from "../../messages";
import { MODES } from "../../types";
import { _DBDATAS } from "../constants";
import { Common } from "./common";

export class Datastreams extends Common {
    constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
        super(ctx, knexInstance);
    }

    formatDataInput(input: Object | undefined): Object | undefined {
        message(true, MODES.OVERRIDE, "formatDataInput");  
        if(input) {            
            if (input["observationType"]) {
                if (!_DBDATAS.Datastreams.columns["observationType"].verify?.list.includes(input["observationType"]))
                 this.ctx.throw(400, { code: 400, detail: messages.errors["observationType"]});
                 
            } else input["observationType"] = _DBDATAS.Datastreams.columns["observationType"].verify?.default;
        }
        return input;
    }
}
