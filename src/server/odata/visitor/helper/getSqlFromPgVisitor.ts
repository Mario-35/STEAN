/**
 * getSqlFromPgVisitor.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createQueryString } from ".";
import { PgVisitor } from "../PgVisitor";

 export function getSqlFromPgVisitor(src: PgVisitor): string {   
    src.includes.forEach((include) => {
        if (include.navigationProperty.includes("/")) {              
            const names = include.navigationProperty.split("/");
            include.navigationProperty = names[0];
            const visitor = new PgVisitor(src.ctx, {...src.options});
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
    src.includes.forEach((item) => item.getSqlFromPgVisitor());
    
    src.sql = createQueryString(src, src);
    return src.onlyValue ? src.sql : src.resultFormat.generateSql(src);
}