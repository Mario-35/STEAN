/**
 * pgQueryFromPgVisitor.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createQueryString, columnsListFromPgVisitor } from ".";
import { addDoubleQuotes, isNull } from "../../../helpers";
import { formatLog } from "../../../logger";
import { asJson } from "../../../db/queries";
import { IpgQuery } from "../../../types";
import { PgVisitor } from "../PgVisitor";
import { models } from "../../../models";

export function pgQueryFromPgVisitor(main: PgVisitor, element: PgVisitor): IpgQuery | undefined { 
    console.log(formatLog.whereIam(element.entity || "blank")); 
    if (element.entity.trim() !== "") {
        const select = columnsListFromPgVisitor(element.entity, main, element);        
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
                        relations[index] = `(${asJson({ 
                            query: createQueryString(main,item), 
                            singular : models.isSingular(main.ctx.config, name),
                            strip: main.ctx.config.stripNull,
                            count: false })}) AS ${addDoubleQuotes(name)}`;
                    }
                });
                relations
                .filter(e => e.includes('SELECT') || Object.keys(main.ctx.model).includes(models.getEntityName(main.ctx.config, e) || e))

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
                    limit: element.limit,
                    count: `SELECT count (DISTINCT ${Object.keys(main.ctx.model[realEntityName].columns)[0]}) from (SELECT ${Object.keys(main.ctx.model[realEntityName].columns)[0]} FROM "${main.ctx.model[realEntityName].table}"${element.where.trim() !== "" ? ` WHERE ${element.where}` : ''}) AS c`
                };
            }    
        }
    }
    
    return undefined;
}