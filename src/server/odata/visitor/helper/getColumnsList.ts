/**
 * getColumnsList.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { columnList, isCsvOrArray, isGraph, isObservation, _DBDATAS } from "../../../db/constants";
import { getEntityName, goodName, removeQuotes } from "../../../helpers";
import { IEntity } from "../../../types";
import { PgVisitor } from "../PgVisitor";

export function getColumnsList(tableName: string, main: PgVisitor, element: PgVisitor): string[] | undefined  {
    const temp = getEntityName(tableName.trim());
    if (!temp) return; 
    const tempEntity:IEntity = _DBDATAS[temp];
    const ResultgroupBy:string [] = [];
    const csvOrArray = isCsvOrArray(main);
    
    const returnValue: string[] = isGraph(main) 
                                    ? ["id", main.interval 
                                        ? `date_trunc('hour', "resultTime") + INTERVAL '15 min' * ROUND(date_part('minute', "resultTime") / 15.0) AS date`
                                        : `"resultTime" as date`] 
                                    : csvOrArray ? ["id"] : [];
    const isSelect =  (element.select != "*") ? true : undefined;
    // create columns list
    let cols =  isSelect 
                    ? element.select.split(",").filter((word: string) => word.trim() != "") 
                    : columnList(tempEntity);

if (element.splitResult) cols = cols.filter(e => e != "result");
    const selfLink =  `CONCAT('${main.options.rootBase}${tempEntity.name}(', "${tempEntity.table}"."id", ')') AS "@iot.selfLink"`; 
    if (!isGraph(main)) { 
        // only ref
        if (element.onlyRef == true ) returnValue.push(selfLink);   
        else cols.forEach((elem: string) => {                    
            elem = removeQuotes(elem);
                if (tempEntity.columns.hasOwnProperty(elem)) {                    
                    const column = tempEntity.columns[elem].alias ||`"${elem}"`;
                    if (main.id) returnValue.push(column.replace(/$ID+/g, <string>main.id) );
                    else returnValue.push(column && column != "" ? column : `"${elem}"`);                    
                    if (elem === "id" && (element.showRelations == true || csvOrArray)) {
                        if (csvOrArray)  main.addToArrayNames("id");            
                        else returnValue.push(selfLink);    
                    }  else  main.addToArrayNames(elem); 
                } else if (tempEntity.relations[elem]) {
                    const tempTable = getEntityName(elem);
                    returnValue.push(`CONCAT('${main.options.rootBase}${tempEntity.name}(', "${tempEntity.table}"."id", ')/${tempTable}') AS "${tempTable}@iot.navigationLink"`);                 
                } 
        });   
    }

    if (isObservation(tempEntity) === true && element.onlyRef === false ) {
        if (isGraph(main) && tempEntity.columns["result"] && tempEntity.columns["result"].alias) returnValue.push(tempEntity.columns["result"].alias);
        if (element.splitResult) element.splitResult.forEach((elem: string) => {
            const alias: string = goodName(element.splitResult && element.splitResult.length === 1 ? "result" : elem);
            returnValue.push( `"_resultnumbers"[(select position from  multidatastream, jsonb_array_elements("multidatastream"."unitOfMeasurements") with ordinality arr(elem, position) where id = "multidatastream_id" and elem->>'name' = '${elem}')] as "${alias}"` );  
            main.addToArrayNames(alias);
            Object.keys(tempEntity.columns).filter((word) => word.includes("_")).forEach(e => ResultgroupBy.push(`"${tempEntity.table}"."${e}"`));
            element.groupBy.push(`"${tempEntity.table}"."id"`);
        });
        else {
            if (!isSelect) element.groupBy = cols.filter(e => tempEntity.columns[removeQuotes(e)].create  != "").map(e => `"${tempEntity.table}"."${e}"`);
                else  if (![_DBDATAS.MultiDatastreams.name, _DBDATAS.Datastreams.name].includes(tableName)) {
                    element.groupBy = cols.filter(e => tempEntity.columns[removeQuotes(e)].create  != "").map(e => `"${tempEntity.table}".${e}`);
                    element.groupBy.push(`"${tempEntity.table}"."id"`);
                }
            ResultgroupBy.forEach(e => element.groupBy.push(e));
            Object.keys(tempEntity.columns).filter((word) => word.includes("_")).forEach(e => element.groupBy.push(e));
        }
    }
    return returnValue;
}

