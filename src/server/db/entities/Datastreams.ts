/**
 * Datastreams entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- Datastreams entity. -----------------------------------!");
import { formatLog } from "../../logger";
import { errors } from "../../messages";
import { koaContext } from "../../types";
import { Common } from "./common";

export class Datastreams extends Common {
  constructor(ctx: koaContext) {
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
