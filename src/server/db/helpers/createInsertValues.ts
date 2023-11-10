/**
 * createInsertValues.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/

import { formatColumnValue } from ".";
import { _DB } from "../constants";

 
export const createInsertValues = (input : object, entityName?: string): string => {    
    if (entityName && _DB[entityName] && _DB[entityName].columns) {
        const keys:string[] = [];
        const values:string[] = [];
        Object.keys(input).forEach((e: string) => {
            const temp = formatColumnValue(input[e], _DB[entityName].columns[e].type);
            if (temp) {
                keys.push(`"${e}"`);
                values.push(temp);
            }
        });
        return `(${keys.join()}) VALUES (${values.join()})`;
    } else {    
        const keys:string[] = [];
        const values:string[] = [];
        Object.keys(input).forEach((e: string) => {
            if (input[e]) {
                keys.push(`"${e}"`);
                values.push(typeof input[e] === "string" ? `'${input[e].replace(/'/g, "\''")}'` : `${input[e]}` );
            }
        }); 
        return `(${keys.join()}) VALUES (${values.join()})`;
    }
};
