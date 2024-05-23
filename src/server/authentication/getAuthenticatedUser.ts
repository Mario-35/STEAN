/**
 * getAuthenticatedUser.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { decodeToken } from ".";
import { userAccess } from "../db/dataAccess";
import { decrypt } from "../helpers";
import { Iuser, koaContext } from "../types";
import { blankUser } from "../views/helpers/blankUser";

export const getAuthenticatedUser = async ( ctx: koaContext ): Promise<Iuser | undefined> => {
  if (ctx.secure === false) return blankUser(ctx);
  const token = decodeToken(ctx);
  if (token && token.id > 0) {
    const user = await userAccess.getSingle(token.id);    
    if (user && token.password.match(decrypt(user["password"])) !== null) return Object.freeze(user);    
  }
  return undefined;
};
