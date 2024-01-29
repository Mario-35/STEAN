/**
 * createService.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";

export const createService = async (ctx: koa.Context): Promise<object> => {
    console.log(ctx.request.body);
    return {}
}
