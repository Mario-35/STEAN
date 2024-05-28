/**
 * HTML Views Index for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- HTML Views Index for API. -----------------------------------!");
import { IqueryOptions } from '../types';
import fs from "fs";
import { createQueryHtmlString } from './helpers';


export { Config } from './class/config';
export { First } from './class/first';
export { Login } from './class/login';
export { HtmlError } from './class/error';
export { Status } from './class/status';
export { UserEdit } from './class/userEdit';
export const createQueryHtml = (params: IqueryOptions): string => createQueryHtmlString(fs.readFileSync(__dirname + "/html/query.html").toString(), params);
