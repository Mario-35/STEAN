/**
 * getAuthenticatedUser.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { decodeToken } from ".";
import { userAccess } from "../db/dataAccess";
import { decrypt } from "../helpers";
import { Iuser } from "../types";

export const getAuthenticatedUser = async ( ctx: koa.Context ): Promise<Iuser | undefined> => {
  const token = decodeToken(ctx);
  if (token && token.id > 0) {
    const user = await userAccess.getSingle(String(token.id));    
    if (user && token.password.match(decrypt(user["password"])) !== null) return Object.freeze(user);    
  }
  return undefined;
};
