/**
 * getColumnsList.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */


import { getAllColumnName, _DB } from "../../../db/constants";
import { getEntityName } from "../../../db/helpers";
import { isCsvOrArray, isGraph, isObservation, removeAllQuotes } from "../../../helpers";
import { Logs } from "../../../logger";
import { Ientity } from "../../../types";
import { PgVisitor } from "../PgVisitor";

function extractColumnName(input: string): string{   
    const elem = input.split(input.includes(' AS ') ? ' AS ' : ".");
    elem.shift();
    return elem.join("."); 
}

export function getColumnsList(tableName: string, main: PgVisitor, element: PgVisitor): string[] | undefined {   
    Logs.whereIam();
    const entityName = getEntityName(tableName.trim());
    if (!entityName) return;
    const tempEntity:Ientity = _DB[entityName];
    const returnValue: string[] = isGraph(main)
                                    ? [ main.interval
                                            ? `timestamp_ceil("resultTime", interval '${main.interval}') AS srcdate`
                                            : `CONCAT('[new Date("', TO_CHAR("resultTime", 'YYYY/MM/DD HH24:MI'), '"), ', result->${main.parentEntity === _DB.MultiDatastreams.name ? "'valueskeys'->src.name" : "'value'"} ,']')`
                                    ] : isCsvOrArray(main) ? ["id"] : [];                                    
                                    
    const selfLink = `CONCAT('${main.options.rootBase}${tempEntity.name}(', "${tempEntity.table}"."id", ')') AS "@iot.selfLink"`; 
    if (element.onlyRef == true ) returnValue.push(selfLink); 
    if (element.showRelations == true ) returnValue.push(selfLink); 
    const isSelect = (element.select === "*" || element.select === "") ? undefined :true ;
    // create columns list
    let cols = isSelect 
                    ? element.select.split(",").filter((word: string) => word.trim() != "")
                    : getAllColumnName(tempEntity, "*", {table: true, as: true, cast: false, numeric: false, test: main.createOptions()});

        
    if (element.splitResult) cols = cols.filter(e => e != "result");

    cols.forEach(e => {
        returnValue.push(e);
        if (main.interval) main.addToIntervalColumns(extractColumnName(e));
        if (e === "id" && (element.showRelations == true || isCsvOrArray(main))) {
            if (isCsvOrArray(main)) main.addToArrayNames("id");            
            else returnValue.push(selfLink);    
        } else {
            const temp = extractColumnName(e);
            main.addToArrayNames(temp === '"@iot.id"' ? '"id"' : temp); 
        }
    });
    if (main.interval) main.addToIntervalColumns(`CONCAT('${main.options.rootBase}${tempEntity.name}(', coalesce("@iot.id", '0')::text, ')') AS "@iot.selfLink"`);

    if (isObservation(tempEntity) === true && element.onlyRef === false ) {
        if (main.interval && !isGraph(main)) returnValue.push(`timestamp_ceil("resultTime", interval '${main.interval}') AS srcdate`);
        if (element.splitResult) element.splitResult.forEach((elem: string) => {
            const alias: string = element.splitResult && element.splitResult.length === 1 ? "result" : elem;
            returnValue.push( `result-> 'valueskeys'->'${element.splitResult && element.splitResult.length === 1 ? removeAllQuotes(element.splitResult[0]) : alias}' AS "${alias}"` );
            main.addToArrayNames(alias);
        });
    }
    return returnValue;
}

