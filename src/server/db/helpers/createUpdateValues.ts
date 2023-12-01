/**
 * createInsertValues.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/

import { formatColumnValue } from ".";
import { ESCAPE_SIMPLE_QUOTE } from "../../constants";
import { _DB } from "../constants";

export const createUpdateValues = (input : object, entityName?: string, ): string => {    
    if (entityName && _DB[entityName] && _DB[entityName].columns) {
        const result:string[] = [];
        Object.keys(input).forEach((e: string) => {
            const temp = formatColumnValue(input[e], _DB[entityName].columns[e].type);
            if (temp) result.push(`"${e}" = ${temp}`);
        });
        return result.join();
    } else {    
        const result:string[] = [];
        Object.keys(input).forEach((e: string) => {
            result.push(`"${e}" = '${ESCAPE_SIMPLE_QUOTE(input[e])}'`);
        });
        return result.join();
    }
};