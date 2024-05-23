/**
 * createInsertValues.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { formatColumnValue } from ".";
import { models } from "..";
import { ESCAPE_SIMPLE_QUOTE } from "../../constants";
import { addDoubleQuotes, addSimpleQuotes, removeDoubleQuotes } from "../../helpers";
import { formatLog } from "../../logger";
import { IconfigFile } from "../../types";

// create postgresSql 
export function createInsertValues(config: IconfigFile, input : object, entityName?: string): string  {
    console.log(formatLog.whereIam());
    if (config && input) {
        const keys:string[] = [];
        const values:string[] = [];            
        if (entityName) {
            const entity = models.getEntity(config, entityName);
            if (!entity) return "";
            Object.keys(input).forEach((e: string) => {
              // @ts-ignore
                if (input[e] && entity.columns[e]) {
                  // @ts-ignore
                  const temp = formatColumnValue(e, input[e], entity.columns[e].type);
                  if (temp) {
                    keys.push(addDoubleQuotes(e));
                    values.push(temp);
                  }
                  // @ts-ignore
                } else if (input[e] && entity.relations[e]) {                
                  const col = entity.relations[e].entityColumn;
                  if (entity.columns[col]) {
                    // @ts-ignore
                    const temp = formatColumnValue(col, input[e], entity.columns[col].type);
                    if (temp) {
                      keys.push(addDoubleQuotes(col));
                      values.push(temp);
                    }  
                  }                  
                }
              });
            } else {
              Object.keys(input).forEach((e: string) => {
                // @ts-ignore
                if (input[e]) {
                  // @ts-ignore
                  if (input[e].startsWith && input[e].startsWith('"{') && input[e].endsWith('}"')) input[e] = removeDoubleQuotes(input[e]);
                  // @ts-ignore
                  else if (input[e].startsWith && input[e].startsWith('{"@iot.name"')) input[e] = `(SELECT "id" FROM "${e.split("_")[0]}" WHERE "name" = '${JSON.parse(removeDoubleQuotes(input[e]))["@iot.name"]}')`;
                  keys.push(addDoubleQuotes(e));
                  // @ts-ignore
                  values.push(typeof input[e] === "string" 
                  // @ts-ignore
                                              ? input[e].startsWith("(SELECT")
                                              // @ts-ignore
                                              ? input[e]
                                              // @ts-ignore
                                              : addSimpleQuotes(ESCAPE_SIMPLE_QUOTE(input[e].trim())) 
                                              // @ts-ignore
                                              : e === "result" ? `'{"value": ${input[e]}}'::jsonb`: ESCAPE_SIMPLE_QUOTE(input[e].trim()));
              }
          });
        }          
        return `(${keys.join()}) VALUES (${values.join()})`;  
    }
    return "";
};