/**
 * pgQueryToString.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 * https://gist.github.com/Atinux/fd2bcce63e44a7d3addddc166ce93fb2
 *
 */

import { IpgQuery } from "../types";
import { cleanStringComma } from ".";

export function pgQueryToString (input: IpgQuery | undefined): string {    
    return input ? 
        `SELECT ${input.select}\n FROM "${input.from}"\n ${input.where 
            ? `WHERE ${input.where}\n` 
            : ''}${input.groupBy 
            ? `GROUP BY ${cleanStringComma(input.groupBy)}\n` 
            : ''}${input.orderby 
            ? `ORDER BY ${cleanStringComma(input.orderby,["ASC","DESC"])}\n` 
            : ''}${input.skip && input.skip > 0 
            ? `OFFSET ${input.skip}\n` 
            : ''} ${input.limit && input.limit > 0 
            ? `LIMIT ${input.limit}\n` 
            : ''}` 
        : 'Error';
}