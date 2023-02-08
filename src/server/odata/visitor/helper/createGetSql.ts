/**
 * createGetSql.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createQuerySelectString, queryAsDataArray, queryAsJson } from ".";
import { isGraph, _DBDATAS } from "../../../db/constants";
import { returnFormats } from "../../../helpers";
import { PgVisitor } from "../PgVisitor";

 export function createGetSql(main: PgVisitor): string {   
    const count = main.timeSeries ? false : true;
    main.includes.forEach((includesItem) => {
        if (includesItem.navigationProperty.includes("/")) {                
            const names = includesItem.navigationProperty.split("/");
            includesItem.navigationProperty = names[0];
            const visitor = new PgVisitor({...main.options});
            if (visitor) {
                visitor.entity =names[0];
                visitor.select = "*";
                visitor.where = "1 = 1";
                visitor.orderby =  "";
                visitor.navigationProperty = names[1];
                includesItem.includes.push(visitor);
            }
        };
    });  
        
    main.includes.forEach((item) => item.asGetSql());

    let fields:string[] = [];

    if (isGraph(main)) {    
        const table = _DBDATAS[main.parentEntity ? main.parentEntity: main.getEntity()].table;
        fields =  [`(select ${table}."description" from ${table} where ${table}."id" = ${main.parentId ? main.parentId: main.id}) AS title, `];
        
    } 
    
    const temp = createQuerySelectString(main, main);
    switch (main.resultFormat) {        
        case returnFormats.dataArray : return queryAsDataArray(main.ArrayNames, temp, false, fields);
        case returnFormats.csv : return queryAsDataArray(main.ArrayNames, temp, false, fields);
        case returnFormats.sql : return temp;
        default : return queryAsJson(temp, false, count, fields);
    }
}