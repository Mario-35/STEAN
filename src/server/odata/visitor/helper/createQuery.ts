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
    console.log(formatLog.whereIam(element.entity || "blank")); 
    if (element.entity.trim() !== "") {
        const select = getColumnsList(element.entity, main, element);        
        if (select) {
            const realEntityName = models.getEntityName(main.ctx.config, element.entity);
            if (realEntityName) {
                const relations: string[] = Object.keys(main.ctx.model[realEntityName].relations);
                element.includes.forEach((item) => {
                    const name = item.navigationProperty;
                    const index = relations.indexOf(name);
                    if (index >= 0) {
                        item.entity = name;
                        item.where += `${item.where.trim() == "" ? '' : " AND "}${main.ctx.model[realEntityName].relations[name].expand}`;                                                            
                        relations[index] = `(${queryAsJson({ 
                            query: createQueryString(main,item), 
                            singular : models.isSingular(main.ctx.config, name),
                            strip: main.ctx.config.stripNull,
                            count: false })}) AS ${addDoubleQuotes(name)}`;
                    }
                });


                relations
                // .filter(e => main.ctx.model[realEntityName].relations[e].extensions.includes(EextensionsType.base) || (main.ctx.model[realEntityName].relations[e]
                //  && main.ctx.model[realEntityName].relations[e].entityName
                //      && main.ctx.model[main.ctx.model[realEntityName].relations[e].entityName].extensions) )
                .forEach((rel: string) => {
                    if (rel[0] == "(") select.push(rel);
                    else if (element.showRelations == true && main.onlyRef == false ) {
                        const tempTable = models.getEntityName(main.ctx.config, rel);
                        let stream: string | undefined = undefined;
                        if (tempTable && !main.ctx.model[realEntityName].relations[rel].relationKey.startsWith("_"))
                            if ( main.ctx.config.stripNull === true && realEntityName === "Observations" &&  tempTable.endsWith("Datastreams")) stream = `CASE WHEN ${main.ctx.model[tempTable].table}_id NOTNULL THEN`;
                                select.push(`${stream ? stream : ""} CONCAT('${main.ctx.decodedUrl.root}/${main.ctx.model[realEntityName].name}(', ${addDoubleQuotes(main.ctx.model[realEntityName].table)}."id", ')/${rel}') ${stream ? "END ": ""}AS "${rel}@iot.navigationLink"`);                            
                                main.addToIntervalColumns(`'${main.ctx.decodedUrl.root}/${main.ctx.model[realEntityName].name}(0)/${rel}' AS "${rel}@iot.navigationLink"`);
                    }
                });
                return { 
                    select: select.join(",\n\t\t"), 
                    from: main.ctx.model[realEntityName].table , 
                    where: element.where, 
                    groupBy: element.groupBy.join(",\n\t"),
                    orderby: isNull(element.orderby) ? main.ctx.model[realEntityName].orderBy : element.orderby,
                    skip: element.skip,
                    limit: element.limit
                };
            }    
        }
    }
    
    return undefined;
}