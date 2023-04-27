/**
 * createQuery.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createSql, getColumnsList } from ".";
import { _DBDATAS } from "../../../db/constants";
import { isObservation, isSingular } from "../../../db/helpers";
import { getEntityName } from "../../../helpers";
import { queryAsJson } from "../../../helpers/returnFormats";
import { Logs } from "../../../logger";
import { IpgQuery } from "../../../types";
import { PgVisitor } from "../PgVisitor";


export function createQueryString(main: PgVisitor, element: PgVisitor): string { 
    Logs.head("createQueryString");  
    const tempIpgQuery = createpgQuery(main, element);
    if (!tempIpgQuery) return "ERROR";
    const sql = createSql(tempIpgQuery);
    return sql;
}

export function createpgQuery(main: PgVisitor, element: PgVisitor): IpgQuery | undefined { 
    Logs.head("createpgQuery");  
    // get the name of the entity
    const realEntity = element.relation ? element.relation : element.getEntity() ;
    if (realEntity) {
        // create select column
        if (element.select.trim() == "") element.select = "*";
        const select: string[] | undefined = getColumnsList(realEntity, main, element); 
        if (select) {
            const realEntityName = getEntityName(realEntity);
            if (realEntityName) {
            const relations: string[] = Object.keys(_DBDATAS[realEntityName].relations);                      
                element.includes.forEach((item) => {                                
                    const name = item.navigationProperty;                                                
                    const index = relations.indexOf(name);
                    if (index >= 0) {
                        item.setEntity(name);
                        item.where += `${item.where.trim() == "" ? '' : " AND "}${_DBDATAS[realEntityName].relations[name].expand}`;                                                            
                        relations[index] = `(${queryAsJson({ 
                            query: createQueryString(main,item), 
                            singular : isSingular(name), 
                            count: false })}) AS "${name}"`;
                        main.addToArrayNames(name);
                    }
                });

                
                // relations.filter((rel: string) => main.config.dbEntities.includes(_DBDATAS[realEntityName].relations[rel].entityName)).forEach((rel: string) => { 
                // relationsList(realEntityName, main.config.dbEntities).forEach((rel: string) => {                    
                relations.forEach((rel: string) => {                    
                    if (rel[0] == "(") select.push(rel);
                    else if (element.showRelations == true && main.onlyRef == false) {
                        const temTable = getEntityName(rel);
                        if (temTable) {
                            select.push(`CONCAT('${main.options.rootBase}${_DBDATAS[realEntityName].name}(', "${_DBDATAS[realEntityName].table}"."id", ')/${rel}') AS "${rel}@iot.navigationLink"`);
                            main.addToBlanks(`'${main.options.rootBase}${_DBDATAS[realEntityName].name}(0)/${rel}' AS "${rel}@iot.navigationLink"`);
                        }
                    }
                });
                return { 
                    select: select.join(",\n\t"), 
                    from: _DBDATAS[realEntityName].table , 
                    where: element.where, 
                    groupBy: element.groupBy.join(",\n\t"),
                    orderby: isObservation(realEntityName) === true ? `${element.orderby},"observation"."phenomenonTime", "observation"."id"` : `${element.orderby}, "id"`,
                    skip: element.skip,
                    limit: element.limit
                };
            }    
        }
    }
    return undefined;
}