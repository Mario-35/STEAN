/**
 * columnsListFromPgVisitor.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import {  _COLUMNSEPARATOR } from "../../../constants";
import { addDoubleQuotes, isCsvOrArray, isGraph, isObservation, removeAllQuotes, removeDoubleQuotes, testStringsIn } from "../../../helpers";
import { formatLog } from "../../../logger";
import { models } from "../../../models";
import { IconfigFile, Ientity, IKeyBoolean } from "../../../types";
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

export function columnsListFromPgVisitor(tableName: string, main: PgVisitor, element: PgVisitor): string[] | undefined {   
    const tests = ["CONCAT", "CASE", "COALESCE"];
    // export function formatedColumn(config: IconfigFile, entity : Ientity, column: string, options?: object): string {
    //     const temp = entity.columns[column] && entity.columns[column].columnAlias(config, { ...options, as: true});
    //     return temp ? temp :  testStringsIn(["CONCAT", "CASE"], column) ? column : `${addDoubleQuotes(entity.table)}.${addDoubleQuotes(column)}`;
    // };

    const formatedColumn= (config: IconfigFile, entity : Ientity, column: string, options?: IKeyBoolean): string | undefined => {   
        if (entity.columns[column]) {
            const alias =  entity.columns[column].columnAlias(config, options ? options : undefined);
            if (testStringsIn(tests, alias || column) === true) return alias || column;
            if (options) {
                if (alias && options["alias"] === true) return alias;
                let result: string = "";
                if (options["table"] === true && (testStringsIn(tests, alias || column) === false)) result += `${addDoubleQuotes(entity.table)}.`;
                result += alias || options["quoted"] === true ? addDoubleQuotes(column) : column;
                if (options["as"] === true || (alias && alias.includes("->")) ) result += ` AS ${addDoubleQuotes(column)}`;
                return result;
            } else return column;
        } else if (testStringsIn(tests, column) === true) return column;
    };

    console.log(formatLog.whereIam(tableName));
    
    // get good entity name
    const tempEntity = models.getEntity(main.ctx.config, tableName);
    if (!tempEntity) {
        console.log(formatLog.error("no entity For", tableName));
        return;
    }
    if(isGraph(main)) return [ main.interval
                                ? `timestamp_ceil("resultTime", interval '${main.interval}') AS srcdate`
                                : `@GRAPH@`];
                                // : `CONCAT('[new Date("', TO_CHAR("resultTime", 'YYYY/MM/DD HH24:MI'), '"), ', result->${main.ctx.model.MultiDatastreams && main.parentEntity === main.ctx.model.MultiDatastreams.name ? "'value'->(select array_position(array(select jsonb_array_elements(\"unitOfMeasurements\")->> 'name' FROM stream), src.name)-1)" : "'value'"} ,']')`];
                                // : `CONCAT('[new Date("', round_minutes("resultTime", 5), '"), ', result->${main.ctx.model.MultiDatastreams && main.parentEntity === main.ctx.model.MultiDatastreams.name ? "'value'->(select array_position(array(select jsonb_array_elements(\"unitOfMeasurements\")->> 'name' FROM stream), src.name)-1)" : "'value'"} ,']')`];

    const returnValue: string[] = isCsvOrArray(main) ? ["id"] : [];                                    
    const selfLink = `CONCAT('${main.ctx.decodedUrl.root}/${tempEntity.name}(', "${tempEntity.table}"."id", ')') AS "@iot.selfLink"`; 
    if (element.onlyRef == true || element.showRelations == true ) returnValue.push(selfLink);
    const columns:string[] = (element.select === "*" || element.select === "")
        ? Object.keys(tempEntity.columns)
            .filter((word) => !word.includes("_"))
            .filter(e => !(e === "result" && element.splitResult))
            .filter(e => !tempEntity.columns[e].extensions || tempEntity.columns[e].extensions && main.ctx.config.extensions.includes(tempEntity.columns[e].extensions || ""))
        : element.select.split(_COLUMNSEPARATOR).filter((word: string) => word.trim() != "").map(e => removeDoubleQuotes(e));
        
    columns.map((column: string) => {
        const force = ["id","result"].includes(column) ? true : false;
        return formatedColumn(main.ctx.config, tempEntity, column, { valueskeys: element.valueskeys, quoted: true, table: true, alias: force, as: isGraph(main) ? false : true } ) || "";
    }) .filter(e => e != "" ).forEach((e: string) => {    
        if (isCsvOrArray(main)) main.addToArrayNames(e);
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
            returnValue.push( `(result->>'valueskeys')::json->'${element.splitResult && one ? removeAllQuotes(element.splitResult[0]) : alias}' AS "${ one ? elem : alias}"` );
            main.addToArrayNames(one ? elem : alias);
        });
    }
    return returnValue;
}

