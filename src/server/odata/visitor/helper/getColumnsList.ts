/**
 * getColumnsList.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { serverConfig } from "../../../configuration";
import { _DB } from "../../../db/constants";
import { columnList, isCsvOrArray, isGraph, isObservation } from "../../../db/helpers";
import { EextensionsType } from "../../../enums";
import { getEntityName, removeQuotes } from "../../../helpers";
import { Ientity } from "../../../types";
import { PgVisitor } from "../PgVisitor";

export function getColumnsList(tableName: string, main: PgVisitor, element: PgVisitor): string[] | undefined {   
    const temp = getEntityName(tableName.trim());
    if (!temp) return;
    const tempEntity:Ientity = _DB[temp];
    const csvOrArray = isCsvOrArray(main);
    const returnValue: string[] = isGraph(main)
                                    ? [
                                    main.interval
                                    ? `timestamp_ceil("resultTime", interval '${main.interval}') AS srcdate`
                                    // : `CONCAT('[',SPLIT_PART(EXTRACT(EPOCH FROM "resultTime")::text,'.',1) , ',', result->${main.parentEntity === _DB.MultiDatastreams.name ? "'valueskeys'->src.name" : "'value'"} ,']\n')`]
                                    : `CONCAT('[new Date("', TO_CHAR("resultTime", 'YYYY/MM/DD HH24:MI'), '"), ', result->${main.parentEntity === _DB.MultiDatastreams.name ? "'valueskeys'->src.name" : "'value'"} ,']')`]
                                    : csvOrArray ? ["id"] : [];                                    
    const isSelect = (element.select === "*" || element.select === "") ? undefined :true ;
    // create columns list
    let cols = isSelect 
        ? element.select.split(",").filter((word: string) => word.trim() != "")
        : columnList(tempEntity);

    if (element.splitResult) cols = cols.filter(e => e != "result");

    const selfLink = `CONCAT('${main.options.rootBase}${tempEntity.name}(', "${tempEntity.table}"."id", ')') AS "@iot.selfLink"`; 
    if (!isGraph(main)) { 
        // only ref
        if (main.interval) main.addToBlanks(`CONCAT('${main.options.rootBase}${tempEntity.name}(', coalesce("@iot.id", '0')::text, ')') AS "@iot.selfLink"`); 
        if (element.onlyRef == true ) returnValue.push(selfLink);   
        else cols.forEach((elem: string) => {     
            elem = removeQuotes(elem);
            if (main.interval) main.addToBlanks(elem);  
            if (tempEntity.columns.hasOwnProperty(elem)) {              
                const column = tempEntity.columns[elem].columnAlias(elem === "result" && !serverConfig.configs[main.configName].extensions.includes(EextensionsType.numeric) ? [main.valuesKeys === true] : undefined) ||`"${elem}"`;                
                if (main.id) returnValue.push(column.replace(/$ID+/g, main.id.toString()) );         
                else returnValue.push(column && column != "" ? column : `"${elem}"`);                    
                if (elem === "id" && (element.showRelations == true || csvOrArray)) {
                    if (csvOrArray) main.addToArrayNames("id");            
                    else returnValue.push(selfLink);    
                } else main.addToArrayNames(elem); 
            } else if (tempEntity.relations[elem]) {
                const tempTable = getEntityName(elem);
                const relation = `CONCAT('${main.options.rootBase}${tempEntity.name}(', "${tempEntity.table}"."id", ')/${tempTable}') AS "${tempTable}@iot.navigationLink"`;   
                returnValue.push(relation);   
                if (main.interval) main.addToBlanks(relation);  
            } 
        });   
    }

    if (isObservation(tempEntity) === true && element.onlyRef === false ) {
        if (main.interval && !isGraph(main)) returnValue.push(`timestamp_ceil("resultTime", interval '${main.interval}') AS srcdate`);
        if (element.splitResult) element.splitResult.forEach((elem: string) => {
            const alias: string = element.splitResult && element.splitResult.length === 1 ? "result" : elem;
            returnValue.push( `result-> 'valueskeys'->'${element.splitResult && element.splitResult.length === 1 ? removeQuotes(element.splitResult[0]) : alias}' AS "${alias}"` );
            main.addToArrayNames(alias);
        });
    }
    return returnValue;
}

