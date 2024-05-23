/**
 * userAuthenticated.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { decodeToken } from ".";
import { koaContext } from "../types";

export const userAuthenticated = (ctx: koaContext): boolean => {  
  if (ctx.config.users === true) {
    const token = decodeToken(ctx);
    return (token && +token.id > 0) ? true : false;
  } else return true;
};
