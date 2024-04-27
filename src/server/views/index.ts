/**
 * HTML Views Index for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { formatLog } from '../logger';
import { IqueryOptions } from '../types';
import { commonHtml } from './helpers';
import fs from "fs";


export { Login } from './class/login';
export { HtmlError } from './class/error';
export { Status } from './class/status';
export { UserEdit } from './class/userEdit';
export const createQueryHtml = (params: IqueryOptions): string => {
    console.log(formatLog.head("createQueryHtml"));
    return commonHtml(fs.readFileSync(__dirname + "/html/query.html").toString(), params);
};