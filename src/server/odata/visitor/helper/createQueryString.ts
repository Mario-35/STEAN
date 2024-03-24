/**
 * createQueryString.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { pgQueryFromPgVisitor, createSql } from ".";
import { formatLog } from "../../../logger";
import { PgVisitor } from "../PgVisitor";


export function createQueryString(main: PgVisitor, element: PgVisitor): string { 
    console.log(formatLog.whereIam()); 
    try {        
        main.pgQuery = pgQueryFromPgVisitor(main, element);
        return main.pgQuery ? createSql(main.pgQuery) : "ERROR";        
    } catch (error) {
        console.log(error);
        return "error";
    } 
}