/**
 * returnFormat interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { PgVisitor } from "../odata";

 export interface IreturnFormat {
    name: string; 
    type: string; 
    format(input: string | object, ctx?: koa.Context): string | object;
    generateSql(input: PgVisitor): string;
}

