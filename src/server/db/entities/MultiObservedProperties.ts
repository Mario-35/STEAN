/**
 * MultiObservedProperties entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
import { koaContext } from "../../types";
import { formatLog } from "../../logger";
import { Common } from "./common";
// onsole.log("!----------------------------------- MultiObservedProperties entity. -----------------------------------!");
export class MultiObservedProperties extends Common {
  constructor(ctx: koaContext) {
    console.log(formatLog.whereIam());
    super(ctx);
  }
}
