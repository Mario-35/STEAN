/**
 * ensureAuthenticated.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { userAuthenticated } from ".";
import { koaContext } from "../types";

export const ensureAuthenticated = (context: koaContext): boolean => userAuthenticated(context);
