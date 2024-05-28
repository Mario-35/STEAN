/**
 * ObservedProperties entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- ObservedProperties entity. -----------------------------------!");
import { koaContext } from "../../types";
import { formatLog } from "../../logger";
import { Common } from "./common";

export class ObservedProperties extends Common {
  constructor(ctx: koaContext) {
    console.log(formatLog.whereIam());
    super(ctx);
  }
}
