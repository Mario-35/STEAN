/**
 * decodeToken.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import jsonwebtoken from "jsonwebtoken";
import koa from "koa";
import { IuserToken } from "../types";

export const decodeToken = (ctx: koa.Context): IuserToken | undefined => {
  if (ctx.request["token"]) {
    const token = jsonwebtoken.decode(ctx.request["token"]);
    if (token && token["data"].id > 0)
      return Object.freeze({
        id: token["data"].id,
        username: token["data"].username,
        password: token["data"].password,
        PDCUAS: token["data"].PDCUAS,
      });
  }
};
