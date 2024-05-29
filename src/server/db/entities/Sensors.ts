/**
 * Sensors entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- Sensors entity. -----------------------------------!");
import { koaContext } from "../../types";
import { formatLog } from "../../logger";
import { Common } from "./common";

export class Sensors extends Common {
  constructor(ctx: koaContext) {
    console.log(formatLog.whereIam());
    super(ctx);
  }
}
