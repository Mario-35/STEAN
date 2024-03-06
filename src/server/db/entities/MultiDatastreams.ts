/**
 * MultiDatastreams entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Common } from "./common";
import { errors, msg } from "../../messages/";
import { formatLog } from "../../logger";

export class MultiDatastreams extends Common {
  constructor(ctx: koa.Context) {
    console.log(formatLog.whereIam());
    super(ctx);
  }

  formatDataInput(input: object | undefined): object | undefined {
    console.log(formatLog.whereIam());
    if (!input) this.ctx.throw(400, { code: 400, detail: errors.noData });
    const temp = this.getKeysValue(input, ["FeaturesOfInterest", "foi"]);
    if (temp) input["_default_foi"] = temp;

    if ( input["multiObservationDataTypes"] && input["unitOfMeasurements"] && input["ObservedProperties"] ) {
      if ( input["multiObservationDataTypes"].length != input["unitOfMeasurements"].length )
        this.ctx.throw(400, {
          code: 400,
          detail: msg(
            errors.sizeListKeysUnitOfMeasurements,
            input["unitOfMeasurements"].length,
            input["multiObservationDataTypes"].length
          ),
        });

      if ( input["multiObservationDataTypes"].length != input["ObservedProperties"].length )
        this.ctx.throw(400, {
          code: 400,
          detail: msg(
            errors.sizeListKeysObservedProperties,
            input["ObservedProperties"].length,
            input["multiObservationDataTypes"].length
          ),
        });
    }
    if ( input && input["multiObservationDataTypes"] && input["multiObservationDataTypes"] != null )
      input["multiObservationDataTypes"] = JSON.stringify( input["multiObservationDataTypes"] )
        .replace("[", "{")
        .replace("]", "}");

    if (input["observationType"]) {
      if ( !this.ctx.model.MultiDatastreams.columns[ "observationType" ].verify?.list.includes(input["observationType"]) )
        this.ctx.throw(400, { code: 400, detail: errors["observationType"] });
    } else
      input["observationType"] =
      this.ctx.model.MultiDatastreams.columns["observationType"].verify?.default;

    return input;
  }
}
