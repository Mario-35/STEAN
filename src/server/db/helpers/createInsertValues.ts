/**
 * createInsertValues.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/

import { formatColumnValue, getEntity } from ".";
import { ESCAPE_SIMPLE_QUOTE } from "../../constants";
import { addDoubleQuotes, addSimpleQuotes } from "../../helpers";

 
export const createInsertValues = (input : object, entityName?: string): string => {    
    if (input) {
        const keys:string[] = [];
        const values:string[] = [];            
        if (entityName) {
            const entity = getEntity(entityName);
            if(!entity) return "";
            Object.keys(input).forEach((e: string) => {                
                if (input[e] && entity.columns[e]) {
                    const temp = formatColumnValue(input[e], entity.columns[e].type);
                    if (temp) {
                        keys.push(addDoubleQuotes(e));
                        values.push(temp);
                    }
                }                
            });
        } else {
            Object.keys(input).forEach((e: string) => {
                if (input[e]) {
                    keys.push(addDoubleQuotes(e));
                    values.push(typeof input[e] === "string" ? addSimpleQuotes(ESCAPE_SIMPLE_QUOTE(input[e])) : input[e] );
                }
            });
        }
        return `(${keys.join()}) VALUES (${values.join()})`;

    }
    return "";
};
