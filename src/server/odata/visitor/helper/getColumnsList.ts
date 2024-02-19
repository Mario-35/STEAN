/**
 * getColumnsList.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { formatedColumn } from ".";
import { ESCAPE_SIMPLE_QUOTE, _COLUMNSEPARATOR } from "../../../constants";
import { isCsvOrArray, isGraph, isObservation, removeAllQuotes, removeDoubleQuotes } from "../../../helpers";
import { formatLog } from "../../../logger";
import { models } from "../../../models";
import { IKeyBoolean } from "../../../types";
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
    console.log(formatLog.whereIam(tableName));
    
    // get good entity name
    const tempEntity = models.getEntity(main.ctx.config, tableName);
    if (!tempEntity) {
        console.log(formatLog.error("no entity For", tableName));
        return;
    } 
    const returnValue: string[] = isGraph(main)
                                    ? [ main.interval
                                            ? `timestamp_ceil("resultTime", interval '${main.interval}') AS srcdate`
                                            : `CONCAT('[new Date("', TO_CHAR("resultTime", 'YYYY/MM/DD HH24:MI'), '"), ', result->${main.ctx.model.MultiDatastreams && main.parentEntity === main.ctx.model.MultiDatastreams.name ? "'valueskeys'->src.name" : "'value'"} ,']')`
                                        ] 
                                    : isCsvOrArray(main) ? ["id"] : [];                                    
                                    
    const selfLink = `CONCAT('${main.ctx.decodedUrl.root}/${tempEntity.name}(', "${tempEntity.table}"."id", ')') AS "@iot.selfLink"`; 
    if (element.onlyRef == true || element.showRelations == true ) returnValue.push(selfLink);
    const all = (element.select === "*" || element.select === "");
    const columns:string[] = all
        ? Object.keys(tempEntity.columns).filter((word) => !word.includes("_")).filter(e => !(e === "result" && element.splitResult))
        : element.select.split(_COLUMNSEPARATOR).filter((word: string) => word.trim() != "").map(e => removeDoubleQuotes(e));
    if (all) element.addToArrayNames(columns.map(e => tempEntity.columns[e].create === "" ? "" : e)); 

    columns.map((column: string) => {
        const force = ["id","result"].includes(column) ? true : false;
        const options: IKeyBoolean = { valueskeys: element.valueskeys, quoted: true, table: true, alias: force, as: force };
        const temp = formatedColumn(main.ctx.config, tempEntity, column, options );
        return temp || "";
    }) .filter(e => e != "" ).forEach((e: string) => {    
        returnValue.push(e);
        if (main.interval) main.addToIntervalColumns(extractColumnName(e));
        if (e === "id" && (element.showRelations == true || isCsvOrArray(main))) {
            if (isCsvOrArray(main)) main.addToArrayNames("id"); 
            else returnValue.push(selfLink);    
        }     
        if (isCsvOrArray(main) && ["payload", "deveui", "phenomenonTime"].includes(removeAllQuotes(e))) main.addToArrayNames(e);

    });
    
    if (main.interval) main.addToIntervalColumns(`CONCAT('${main.ctx.decodedUrl.root}/${tempEntity.name}(', coalesce("@iot.id", '0')::text, ')') AS "@iot.selfLink"`);
    if (isObservation(tempEntity) === true && element.onlyRef === false ) {
        if (main.interval && !isGraph(main)) returnValue.push(`timestamp_ceil("resultTime", interval '${main.interval}') AS srcdate`);
        if (element.splitResult) element.splitResult.forEach((elem: string) => {
            const one = element && element.splitResult && element.splitResult.length === 1;
            const alias: string = one ? "result" : elem;
            returnValue.push( `result-> 'valueskeys'->'${ESCAPE_SIMPLE_QUOTE(element.splitResult && one ? removeAllQuotes(element.splitResult[0]) : alias)}' AS "${ one ? elem : alias}"` );
            main.addToArrayNames(one ? elem : alias);
        });
    }
    return returnValue;
}

