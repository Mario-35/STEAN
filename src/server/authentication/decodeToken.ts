/**
 * decodeToken.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import jsonwebtoken from "jsonwebtoken";
import { IuserToken, koaContext } from "../types";
import { blankUserToken } from "../types/userToken";

export const decodeToken = (ctx: koaContext): IuserToken => {
  if (ctx.request.hasOwnProperty("token")) {
    // @ts-ignore
    const token = jsonwebtoken.decode(ctx.request["token"]);
    // @ts-ignore
    if (token && token["data"].id > 0)
    // @ts-ignore
      return Object.freeze({ id: token["data"].id, username: token["data"].username, password: token["data"].password, PDCUAS: token["data"].PDCUAS, });
  }
  return blankUserToken;
};
