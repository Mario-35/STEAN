/**
 * ObservedProperties entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Common } from "./common";

export class ObservedProperties extends Common {
    constructor(ctx: koa.Context) {
         super(ctx);
    }
}
