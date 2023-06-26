/**
 * Things entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Common } from "./common";
// http://docs.opengeospatial.org/is/15-078r6/15-078r6.html#25
export class Things extends Common {
    constructor(ctx: koa.Context) {
         super(ctx);
    }
}
