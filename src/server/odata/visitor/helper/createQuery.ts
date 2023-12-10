/**
 * createQuery.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createSql, getColumnsList } from ".";
import { _DB } from "../../../db/constants";
import { addDoubleQuotes, isNull, isSingular } from "../../../helpers";
import { Logs } from "../../../logger";
import { queryAsJson } from "../../../db/queries";
import { IpgQuery } from "../../../types";
import { PgVisitor } from "../PgVisitor";
import { serverConfig } from "../../../configuration";
import { getEntityName } from "../../../db/helpers";


export function createQueryString(main: PgVisitor, element: PgVisitor): string { 
    Logs.whereIam();  
    const tempPgQuery = createPgQuery(main, element);
    return tempPgQuery ? createSql(tempPgQuery) : "ERROR";
}

export function createPgQuery(main: PgVisitor, element: PgVisitor): IpgQuery | undefined { 
    Logs.whereIam();
    // const realEntity = element.relation ||element.entity ;
    const select: string[] | undefined = getColumnsList(element.entity, main, element); 
    if (select) {
        const realEntityName = getEntityName(element.entity);
        if (realEntityName) {
            const relations: string[] = Object.keys(_DB[realEntityName].relations).filter((e: string) => serverConfig.configs[main.configName]._context.entities.includes(_DB[realEntityName].relations[e].entityName));
            element.includes.forEach((item) => {                                
                const name = item.navigationProperty;                                                
                const index = relations.indexOf(name);
                if (index >= 0) {
                    item.entity = name;
                    item.where += `${item.where.trim() == "" ? '' : " AND "}${_DB[realEntityName].relations[name].expand}`;                                                            
                    relations[index] = `(${queryAsJson({ 
                        query: createQueryString(main,item), 
                        singular : isSingular(name), 
                        count: false })}) AS ${addDoubleQuotes(name)}`;
                    main.addToArrayNames(name);
                }
            });
            relations.forEach((rel: string) => {                    
                if (rel[0] == "(") select.push(rel);
                else if (element.showRelations == true && main.onlyRef == false ) {
                    const tempTable = getEntityName(rel);
                    if (tempTable) {
                        if(!_DB[realEntityName].relations[rel].relationKey.startsWith("_"))
                            select.push(`CONCAT('${main.options.rootBase}${_DB[realEntityName].name}(', ${addDoubleQuotes(_DB[realEntityName].table)}."id", ')/${rel}') AS "${rel}@iot.navigationLink"`);                            
                        if(!_DB[realEntityName].relations[rel].relationKey.startsWith("_"))
                            main.addToIntervalColumns(`'${main.options.rootBase}${_DB[realEntityName].name}(0)/${rel}' AS "${rel}@iot.navigationLink"`);
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
    return undefined;
}