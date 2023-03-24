/**
 * createGetSql.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createQueryString } from ".";
import { _DBDATAS } from "../../../db/constants";
import { PgVisitor } from "../PgVisitor";

 export function createGetSql(main: PgVisitor): string {   
    main.includes.forEach((includesItem) => {
        if (includesItem.navigationProperty.includes("/")) {                
            const names = includesItem.navigationProperty.split("/");
            includesItem.navigationProperty = names[0];
            const visitor = new PgVisitor({...main.options});
            if (visitor) {
                visitor.entity =names[0];
                visitor.select = "*";
                visitor.where = "1 = 1";
                visitor.orderby = "";
                visitor.navigationProperty = names[1];
                includesItem.includes.push(visitor);
            }
        };
    });  
        
    main.includes.forEach((item) => item.asGetSql());
    main.sql = createQueryString(main, main);
    return main.onlyValue ? main.sql :  main.resultFormat.generateSql(main);
}