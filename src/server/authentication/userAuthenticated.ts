/**
 * userAuthenticated.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { decodeToken } from ".";

export const userAuthenticated = (ctx: koa.Context): boolean => {
  const token = decodeToken(ctx);
  return (token && +token.id > 0) ? true : false;
};
