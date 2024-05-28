/**
 * FeaturesOfInterest entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- FeaturesOfInterest entity. -----------------------------------!");
import { formatLog } from "../../logger";
import { koaContext } from "../../types";
import { Common } from "./common";

export class FeaturesOfInterest extends Common {
  constructor(ctx: koaContext) {
    console.log(formatLog.whereIam());
    super(ctx);
  }
}
