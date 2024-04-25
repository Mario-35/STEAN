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
    console.log(formatLog.whereIam());
    super(ctx);
  }

  formatDataInput(input: object | undefined): object | undefined {
    console.log(formatLog.whereIam());
    if (input) {
      const colName = "observationType";
      if (input[colName]) {
        if ( !this.ctx.model.Datastreams.columns[ colName ].verify?.list.includes(input[colName]) )
          this.ctx.throw(400, { code: 400, detail: errors[colName] });
      } else
        input[colName] = this.ctx.model.Datastreams.columns[colName].verify?.default;
    }
    return input;
  }
}
