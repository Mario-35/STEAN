/**
 * Datastreams entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";
import koa from "koa";
import { Logs } from "../../logger";
import { messages } from "../../messages";
import { Common } from "./common";

export class Datastreams extends Common {
    constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
        super(ctx, knexInstance);
    }

    formatDataInput(input: object | undefined): object | undefined {
        Logs.override("formatDataInput");  
        if(input) {            
            const temp = this.getKeysValue(input, ["FeaturesOfInterest", "foi"]);            
            if (temp) input["_default_foi"] = temp;
            if (input["observationType"]) {
                if (!this.DBST.Datastreams.columns["observationType"].verify?.list.includes(input["observationType"]))
                 this.ctx.throw(400, { code: 400, detail: messages.errors["observationType"]});
                 
            } else input["observationType"] = this.DBST.Datastreams.columns["observationType"].verify?.default;
        }
        return input;
    }
}
