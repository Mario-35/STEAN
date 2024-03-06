/**
 * Locations entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { formatLog } from "../../logger";
import { Common } from "./common";

export class Locations extends Common {
  constructor(ctx: koa.Context) {
    console.log(formatLog.whereIam());
    super(ctx);
  }
}
