/**
 * createInsertValues.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/

import { formatColumnValue } from ".";
import { ESCAPE_SIMPLE_QUOTE } from "../../constants";
import { addDoubleQuotes, addSimpleQuotes } from "../../helpers";
import { _DB } from "../constants";

export const createUpdateValues = (input : object, entityName?: string, ): string => {    
    const result:string[] = [];
    if (entityName && _DB[entityName] && _DB[entityName].columns) 
        Object.keys(input).forEach((e: string) => {
            const temp = formatColumnValue(input[e], _DB[entityName].columns[e].type);
            if (temp) result.push(`${addDoubleQuotes(e)} = ${temp}`);
        });
     else Object.keys(input).forEach((e: string) => {
            result.push(`${addDoubleQuotes(e)} = ${addSimpleQuotes(ESCAPE_SIMPLE_QUOTE(input[e]))}`);
        });
    return result.join();
};