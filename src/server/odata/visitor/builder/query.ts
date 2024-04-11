/**
 * OrderBy builder
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _COLUMNSEPARATOR } from "../../../constants";
import { formatLog } from "../../../logger";
import { addDoubleQuotes, cleanStringComma } from "../../../helpers";
import { asJson } from "../../../db/queries";
import { IpgQuery } from "../../../types";
import { PgVisitor, RootPgVisitor } from "..";
import { models } from "../../../models";
import { columnList } from "./columns";
import { GroupBy } from "./groupBy";
import { OrderBy } from "./orderBy";
import { Select } from "./select";
import { Where } from "./where";

export class Query  {
    where: Where;
    select: Select;
    orderBy: OrderBy;
    groupBy: GroupBy;
  
    constructor() {
      console.log(formatLog.whereIam());
      this.where = new Where("");
      this.select = new Select("");
      this.orderBy = new OrderBy("");
      this.groupBy = new GroupBy("");
    }

    private create(main: RootPgVisitor | PgVisitor, _element?: PgVisitor): IpgQuery | undefined { 
        const element = _element ? _element : main;
        console.log(formatLog.whereIam(element.entity || "blank"));
        if (element.entity.trim() !== "") {
            const select = columnList(element.entity, main, element);        
            if (select) {
                const realEntityName = models.getEntityName(main.ctx.config, element.entity);
                if (realEntityName) {
                    const relations: string[] = Object.keys(main.ctx.model[realEntityName].relations);
                    element.includes.forEach((item) => {
                        const name = item.navigationProperty;
                        const index = relations.indexOf(name);
                        if (index >= 0) {
                            item.entity = name;
                            item.query.where.add(`${item.query.where.toString().trim() == "" ? '' : " AND "}${main.ctx.model[realEntityName].relations[name].expand}`);                                                            
                            relations[index] = `(${asJson({ 
                                query: this.pgQueryToString(this.create(main, item)), 
                                singular : models.isSingular(main.ctx.config, name),
                                strip: main.ctx.config.stripNull,
                                count: false })}) AS ${addDoubleQuotes(name)}`;
                        }
                    });
                    relations
                    .filter(e => e.includes('SELECT') || Object.keys(main.ctx.model).includes(models.getEntityName(main.ctx.config, e) || e))
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
                        where: element.query.where.toString(), 
                        groupBy: element.query.groupBy.notNull() === true ?  element.query.groupBy.toString() : undefined,
                        orderby: element.query.orderBy.notNull() === true ?  element.query.orderBy.toString() : main.ctx.model[realEntityName].orderBy,
                        skip: element.skip,
                        limit: element.limit,
                        count: `SELECT count (DISTINCT ${Object.keys(main.ctx.model[realEntityName].columns)[0]}) from (SELECT ${Object.keys(main.ctx.model[realEntityName].columns)[0]} FROM "${main.ctx.model[realEntityName].table}"${element.query.where.notNull() === true ? ` WHERE ${element.query.where.toString()}` : ''}) AS c`
                    };
                }    
            }
        }
        
        return undefined;
    }

    private pgQueryToString (input: IpgQuery | undefined): string {    
        return input ? 
            `SELECT ${input.select}\n FROM "${input.from}"\n ${input.where 
                ? `WHERE ${input.where}\n` 
                : ''}${input.groupBy 
                ? `GROUP BY ${cleanStringComma(input.groupBy)}\n` 
                : ''}${input.orderby 
                ? `ORDER BY ${cleanStringComma(input.orderby,["ASC","DESC"])}\n` 
                : ''}${input.skip && input.skip > 0 
                ? `OFFSET ${input.skip}\n` 
                : ''} ${input.limit && input.limit > 0 
                ? `LIMIT ${input.limit}\n` 
                : ''}` 
            : 'Error';
    }

    toString (main: RootPgVisitor | PgVisitor): string {    
        return this.pgQueryToString(this.toPgQuery(main))
    }

    toPgQuery (main: RootPgVisitor | PgVisitor): IpgQuery | undefined {    
        return this.create(main);
    }
}
