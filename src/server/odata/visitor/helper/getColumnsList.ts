/**
 * getColumnsList.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { REMOVE_FIRST_END_CHAR, _COLUMNSEPARATOR } from "../../../constants";
import { getColumnNameOrAlias } from "../../../db/helpers";
import { isCsvOrArray, isGraph, isObservation, removeAllQuotes, testStringsIn } from "../../../helpers";
import { formatLog } from "../../../logger";
import { models } from "../../../models";
import { PgVisitor } from "../PgVisitor";

function extractColumnName(input: string): string{   
    const elem = input.split(input.includes(' AS ') ? ' AS ' : ".");
    elem.shift();
    return elem.join("."); 
}

/**
 * 
 * @param tableName name of the table
 * @param main PgVisitor
 * @param element table PgVisitor 
 * @returns array of formated postgresSQL columns
 */
export function getColumnsList(tableName: string, main: PgVisitor, element: PgVisitor): string[] | undefined {   
    console.log(formatLog.whereIam());
    // get good entity name
    const tempEntity = models.getEntity(main.ctx._config, tableName);
    if (!tempEntity) return;
    const returnValue: string[] = isGraph(main)
                                    ? [ main.interval
                                            ? `timestamp_ceil("resultTime", interval '${main.interval}') AS srcdate`
                                            : `CONCAT('[new Date("', TO_CHAR("resultTime", 'YYYY/MM/DD HH24:MI'), '"), ', result->${main.ctx._model.MultiDatastreams && main.parentEntity === main.ctx._model.MultiDatastreams.name ? "'valueskeys'->src.name" : "'value'"} ,']')`
                                        ] 
                                    : isCsvOrArray(main) ? ["id"] : [];                                    
                                    
    const selfLink = `CONCAT('${main.options.rootBase}${tempEntity.name}(', "${tempEntity.table}"."id", ')') AS "@iot.selfLink"`; 
    if (element.onlyRef == true || element.showRelations == true ) returnValue.push(selfLink);
    const all = (element.select === "*" || element.select === "");
    const columns = all
        ? Object.keys(tempEntity.columns).filter((word) => !word.includes("_")) 
        : element.select.split(_COLUMNSEPARATOR).filter((word: string) => word.trim() != "").map(e => REMOVE_FIRST_END_CHAR(e, '"'));
    
        if (all) element.addToArrayNames(columns);        
        const cols =  columns.map((column: string) => {     
        const columnTemp = getColumnNameOrAlias(main.ctx._config, tempEntity, column, { table: true, as: true, cast: false, numeric: false, test: main.createOptions() });
        return columnTemp ? columnTemp : testStringsIn(["CONCAT", "CASE"], column) ? column : "";
    }).filter(e => e != "");

    cols.forEach((e: string) => {           
        returnValue.push(e);
        if (main.interval) main.addToIntervalColumns(extractColumnName(e));
        if (e === "id" && (element.showRelations == true || isCsvOrArray(main))) {
            if (isCsvOrArray(main)) main.addToArrayNames("id"); 
            else returnValue.push(selfLink);    
        }     
        if (isCsvOrArray(main) && ["payload", "deveui", "phenomenonTime"].includes(removeAllQuotes(e))) main.addToArrayNames(e);

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

