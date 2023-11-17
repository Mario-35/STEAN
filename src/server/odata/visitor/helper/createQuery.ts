/**
 * createQuery.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createSql, getColumnsList } from ".";
import { _DB } from "../../../db/constants";
import { getEntityName, isNull, isSingular } from "../../../helpers";
import { Logs } from "../../../logger";
import { queryAsJson } from "../../../db/queries";
import { IpgQuery } from "../../../types";
import { PgVisitor } from "../PgVisitor";
import { serverConfig } from "../../../configuration";


export function createQueryString(main: PgVisitor, element: PgVisitor): string { 
    Logs.whereIam();  
    const tempIpgQuery = createPgQuery(main, element);
    if (!tempIpgQuery) return "ERROR";
    return createSql(tempIpgQuery);
}

export function createPgQuery(main: PgVisitor, element: PgVisitor): IpgQuery | undefined { 
    Logs.whereIam();  
    // get the name of the entity
    const realEntity = element.relation ? element.relation : element.getEntity() ;
    if (realEntity) {
        // create select column
        // if (element.select.trim() == "") element.select = "*";
        const select: string[] | undefined = getColumnsList(realEntity, main, element); 
        if (select) {
            const realEntityName = getEntityName(realEntity);
            if (realEntityName) {
                const relations: string[] = Object.keys(_DB[realEntityName].relations).filter((e: string) => serverConfig.configs[main.configName]._context.entities.includes(_DB[realEntityName].relations[e].entityName));
                element.includes.forEach((item) => {                                
                    const name = item.navigationProperty;                                                
                    const index = relations.indexOf(name);
                    if (index >= 0) {
                        item.setEntity(name);
                        item.where += `${item.where.trim() == "" ? '' : " AND "}${_DB[realEntityName].relations[name].expand}`;                                                            
                        relations[index] = `(${queryAsJson({ 
                            query: createQueryString(main,item), 
                            singular : isSingular(name), 
                            count: false })}) AS "${name}"`;
                        main.addToArrayNames(name);
                    }
                });
                relations.forEach((rel: string) => {                    
                    if (rel[0] == "(") select.push(rel);
                    else if (element.showRelations == true && main.onlyRef == false ) {
                        const temTable = getEntityName(rel);
                        if (temTable) {
                            if(!_DB[realEntityName].relations[rel].relationKey.startsWith("_"))
                            select.push(`CONCAT('${main.options.rootBase}${_DB[realEntityName].name}(', "${_DB[realEntityName].table}"."id", ')/${rel}') AS "${rel}@iot.navigationLink"`);                            
                            if(!_DB[realEntityName].relations[rel].relationKey.startsWith("_"))
                            main.addToBlanks(`'${main.options.rootBase}${_DB[realEntityName].name}(0)/${rel}' AS "${rel}@iot.navigationLink"`);
                        }
                    }
                });
                return { 
                    select: select.join(",\n\t"), 
                    from: _DB[realEntityName].table , 
                    where: element.where, 
                    groupBy: element.groupBy.join(",\n\t"),
                    orderby: isNull(element.orderby) ? _DB[realEntityName].orderBy : element.orderby,
                    skip: element.skip,
                    limit: element.limit
                };
            }    
        }
    }
    return undefined;
}