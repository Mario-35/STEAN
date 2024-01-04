/**
 * createQuery.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createSql, getColumnsList } from ".";
import { addDoubleQuotes, isNull } from "../../../helpers";
import { formatLog } from "../../../logger";
import { queryAsJson } from "../../../db/queries";
import { IpgQuery } from "../../../types";
import { PgVisitor } from "../PgVisitor";
import { models } from "../../../models";


export function createQueryString(main: PgVisitor, element: PgVisitor): string { 
    console.log(formatLog.whereIam()); 
    try {
        const tempPgQuery = createPgQuery(main, element);
        return tempPgQuery ? createSql(tempPgQuery) : "ERROR";        
    } catch (error) {
        console.log(error);
        return "error";
    } 
}

export function createPgQuery(main: PgVisitor, element: PgVisitor): IpgQuery | undefined { 
    const select: string[] | undefined = getColumnsList(element.entity, main, element);     
    if (select) {
        const realEntityName = models.getEntityName(main.ctx._config, element.entity);
        if (realEntityName) {
            const relations: string[] = Object.keys(main.ctx._model[realEntityName].relations).filter((e: string) => Object.keys(main.ctx._model).includes(main.ctx._model[realEntityName].relations[e].entityName));
            element.includes.forEach((item) => {                                
                const name = item.navigationProperty;                                                
                const index = relations.indexOf(name);
                if (index >= 0) {
                    item.entity = name;
                    item.where += `${item.where.trim() == "" ? '' : " AND "}${main.ctx._model[realEntityName].relations[name].expand}`;                                                            
                    relations[index] = `(${queryAsJson({ 
                        query: createQueryString(main,item), 
                        singular : models.isSingular(main.ctx._config, name),                        
                        count: false })}) AS ${addDoubleQuotes(name)}`;
                    main.addToArrayNames(name);
                }
            });
            relations.forEach((rel: string) => {                    
                if (rel[0] == "(") select.push(rel);
                else if (element.showRelations == true && main.onlyRef == false ) {
                    const tempTable = models.getEntityName(main.ctx._config, rel);
                    if (tempTable) {
                        if (!main.ctx._model[realEntityName].relations[rel].relationKey.startsWith("_"))
                            select.push(`CONCAT('${main.options.rootBase}${main.ctx._model[realEntityName].name}(', ${addDoubleQuotes(main.ctx._model[realEntityName].table)}."id", ')/${rel}') AS "${rel}@iot.navigationLink"`);                            
                        if (!main.ctx._model[realEntityName].relations[rel].relationKey.startsWith("_"))
                            main.addToIntervalColumns(`'${main.options.rootBase}${main.ctx._model[realEntityName].name}(0)/${rel}' AS "${rel}@iot.navigationLink"`);
                    }
                }
            });
            return { 
                select: select.join(",\n\t"), 
                from: main.ctx._model[realEntityName].table , 
                where: element.where, 
                groupBy: element.groupBy.join(",\n\t"),
                orderby: isNull(element.orderby) ? main.ctx._model[realEntityName].orderBy : element.orderby,
                skip: element.skip,
                limit: element.limit
            };
        }    
    }
    return undefined;
}