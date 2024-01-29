/**
 * createGetSql.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createQueryString } from ".";
import { PgVisitor } from "../PgVisitor";

 export function createGetSql(main: PgVisitor): string {   
    main.includes.forEach((include) => {
        if (include.navigationProperty.includes("/")) {              
            const names = include.navigationProperty.split("/");
            include.navigationProperty = names[0];
            const visitor = new PgVisitor(main.ctx, {...main.options});
            if (visitor) {
                visitor.entity =names[0];
                visitor.select = "*";
                visitor.where = "1 = 1";
                visitor.orderby = "";
                visitor.navigationProperty = names[1];
                include.includes.push(visitor);
            }            
        }
    });  
    main.includes.forEach((item) => item.createGetSql());
    main.sql = createQueryString(main, main);
    return main.onlyValue ? main.sql : main.resultFormat.generateSql(main);
}