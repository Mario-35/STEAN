/**
 * MultiDatastreams entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";
import koa from "koa";
import { message } from "../../logger";
import { Common } from "./common";
import { messages, messagesReplace } from "../../messages/";


export class MultiDatastreams extends Common {
    constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
        super(ctx, knexInstance);
    }

    formatDataInput(input: Object | undefined): Object | undefined {
        message(true, "HEAD", `class ${this.constructor.name} override formatDataInput`);
        if (!input)
            this.ctx.throw(400, { code: 400, detail: messages.errors.noData });

        if (input["multiObservationDataTypes"] && input["unitOfMeasurements"] && input["ObservedProperties"]) {
            if (input["multiObservationDataTypes"].length != input["unitOfMeasurements"].length)
                this.ctx.throw(400, { code: 400,  detail: messagesReplace(messages.errors.sizeListKeysUnitOfMeasurements, [input["unitOfMeasurements"].length, input["multiObservationDataTypes"].length]) });

            if (input["multiObservationDataTypes"].length != input["ObservedProperties"].length)
                this.ctx.throw(400, { code: 400,  detail: messagesReplace(messages.errors.sizeListKeysObservedProperties, [input["ObservedProperties"].length, input["multiObservationDataTypes"].length]) });
        }
        if (input && input["multiObservationDataTypes"] && input["multiObservationDataTypes"] != null)
            input["multiObservationDataTypes"] = JSON.stringify(input["multiObservationDataTypes"]).replace("[", "{").replace("]", "}");

        return input;
    }
}
