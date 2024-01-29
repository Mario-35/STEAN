/**
 * Datastreams entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { formatLog } from "../../logger";
import { errors } from "../../messages";
import { Common } from "./common";

export class Datastreams extends Common {
  constructor(ctx: koa.Context) {
    super(ctx);
  }

  formatDataInput(input: object | undefined): object | undefined {
    console.log(formatLog.whereIam());
    if (input) {
      if (input["observationType"]) {
        if ( !this.ctx._model.Datastreams.columns[ "observationType" ].verify?.list.includes(input["observationType"]) )
          this.ctx.throw(400, { code: 400, detail: errors["observationType"] });
      } else
        input["observationType"] = this.ctx._model.Datastreams.columns["observationType"].verify?.default;
    }
    return input;
  }
}
