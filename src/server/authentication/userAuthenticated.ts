/**
 * userAuthenticated
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- userAuthenticated -----------------------------------!");
import { decodeToken } from ".";
import { EnumOptions } from "../enums";
import { koaContext } from "../types";

export const userAuthenticated = (ctx: koaContext): boolean => {  
  if (ctx.config.options.includes(EnumOptions.users)) {
    const token = decodeToken(ctx);
    return (token && +token.id > 0) ? true : false;
  } else return true;
};
