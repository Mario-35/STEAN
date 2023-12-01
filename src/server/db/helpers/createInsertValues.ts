/**
 * createInsertValues.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/

import { formatColumnValue, getEntity } from ".";
import { ESCAPE_SIMPLE_QUOTE } from "../../constants";
import { _DB } from "../constants";

 
export const createInsertValues = (input : object, entityName?: string): string => {    
    if (input) {
        if (entityName) {
            const entity = getEntity(entityName);
            if(!entity) return "";
            const keys:string[] = [];
            const values:string[] = [];            
            Object.keys(input).forEach((e: string) => {                
                if (input[e] && entity.columns[e]) {
                    const temp = formatColumnValue(input[e], entity.columns[e].type);
                    if (temp) {
                        keys.push(`"${e}"`);
                        values.push(temp);
                    }
                }                
            });
            return `(${keys.join()}) VALUES (${values.join()})`;
        } else {    
            const keys:string[] = [];
            const values:string[] = [];
            Object.keys(input).forEach((e: string) => {
                if (input[e]) {
                    keys.push(`"${e}"`);
                    values.push(typeof input[e] === "string" ? `'${ESCAPE_SIMPLE_QUOTE(input[e])}'` : `${input[e]}` );
                }
            }); 
            return `(${keys.join()}) VALUES (${values.join()})`;
        }

    }
    return "";
};
