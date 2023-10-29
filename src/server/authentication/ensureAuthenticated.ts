/**
 * ensureAuthenticated.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { userAuthenticated } from ".";
import { isTest } from "../helpers";

export const ensureAuthenticated = (context: koa.Context): boolean =>
  isTest() ? true : userAuthenticated(context);
