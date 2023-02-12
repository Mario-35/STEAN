/**
 * getColumnsList.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { isGraph, _DBDATAS } from "../../../db/constants";
import { getEntityName, goodName, removeQuotes, returnFormats } from "../../../helpers";
import { PgVisitor } from "../PgVisitor";

export function getColumnsList(tableName: string, main: PgVisitor, element: PgVisitor): string[] | undefined  {
    const name = getEntityName(tableName.trim());
    if (!name) return; 
    const graph = isGraph(main);
    const csvOrArray = [returnFormats.dataArray, returnFormats.csv].includes(main.resultFormat);
    const returnValue: string[] = graph == true ? ["id", `to_char("resultTime", 'YYYY-MM-DD HH:mi') as "date"`] : [];
    const isSelect =  (element.select && element.select != "*") || false;
    // create columns list
    const cols =  isSelect ? element.select.split(",").filter((word: string) => word.trim() != "") : Object.keys(_DBDATAS[name].columns).filter((word) => !["resultnumber","resultnumbers"].includes(word) && !word.startsWith("_") && !word.endsWith("_id") );
    const selfLink =  `CONCAT('${main.options.rootBase}${_DBDATAS[name].name}(', "${_DBDATAS[name].table}"."id", ')') AS "@iot.selfLink"`; 
    if (graph == false ) { 
        // only ref
        if (element.ref == true ) returnValue.push(selfLink);   
        else cols.forEach((elem: string) => {                    
            elem = removeQuotes(elem);
                if (_DBDATAS[name].columns.hasOwnProperty(elem)) {
                    let alias = csvOrArray ? undefined :_DBDATAS[name].columns[elem].alias;
                    if (main.id && alias) alias = alias.replace(/[$ID]+/g, <string>main.id) ;
                    returnValue.push(`${alias ?  alias : `"${elem}"`}`);                    
                    if (elem === "id" && (element.showRelations == true || csvOrArray)) {
                        if (csvOrArray)  main.addToArrayNames("id");            
                        else returnValue.push(selfLink);    
                    }  else  if (alias != undefined || !isSelect) main.addToArrayNames(elem); 
                } else if (_DBDATAS[name].relations[elem]) {
                    const tempTable = getEntityName(elem);
                    returnValue.push(`CONCAT('${main.options.rootBase}${_DBDATAS[name].name}(', "${_DBDATAS[name].table}"."id", ')/${tempTable}') AS "${tempTable}@iot.navigationLink"`);                 
                } 
        });   
    }
    if (tableName === _DBDATAS.Observations.name && element.ref == false ) {
        if (element.splitResult) element.splitResult.forEach((elem: string) => {
            const alias: string = goodName(element.splitResult && element.splitResult.length === 1 ? "result" : elem);
            returnValue.push(
                `"resultnumbers"[(select position from  multidatastream, jsonb_array_elements("multidatastream"."unitOfMeasurements") with ordinality arr(elem, position) where id = "multidatastream_id" and elem->>'name' = '${elem}')] as "${alias}"`
                );  
                main.addToArrayNames(alias);
                             
            }); else {           

            switch (element.parentEntity) {
               
               case _DBDATAS.MultiDatastreams.name: 
               const keys = `(select jsonb_agg(tmp.units -> 'name') as keys from ( select jsonb_array_elements("unitOfMeasurements") as units from multidatastream where id = ${element.parentId} ) as tmp) as keys`;
                    returnValue.push( `(SELECT json_object_agg(key, value) from ( SELECT jsonb_array_elements_text("keys") as key, unnest("observation"."resultnumbers")::float8 as value from ( SELECT keys from ${keys} ) as tmp2 ) as tmp3) as "result"`);
                    main.addToArrayNames("result");  
                    break;
                case _DBDATAS.Datastreams.name:                            
                    returnValue.push( `"observation"."resultnumber" as "result"`);
                    main.addToArrayNames("result");  
                    break;
                default:      
                    returnValue.push(`CASE WHEN ("multidatastream_id" is null) THEN json_object_agg('result', "observation"."resultnumber")->'result' ELSE ( SELECT json_object_agg(key, value) from ( SELECT jsonb_array_elements_text("keys") as key, unnest("observation"."resultnumbers")::float8 as value from ( SELECT (select jsonb_agg(tmp.units -> 'name') as keys from ( select jsonb_array_elements("unitOfMeasurements") as units from multidatastream where id = "multidatastream_id" ) as tmp) ) as tmp2 ) as tmp3) end as "result"`);
                    main.addToArrayNames("result");  
                    break;
            }

            if (isSelect === false) {
                element.groupBy = cols.map(e => `"${_DBDATAS[name].table}"."${e}"`);
                element.groupBy.push(`"${_DBDATAS[name].table}"."resultnumber"`,`"${_DBDATAS[name].table}"."datastream_id"`, `"${_DBDATAS[name].table}"."resultnumbers"`,`"${_DBDATAS[name].table}"."multidatastream_id"`);

            } else  if (![_DBDATAS.MultiDatastreams.name, _DBDATAS.Datastreams.name].includes(tableName)) {                
                    element.groupBy = cols.map(e => `"${_DBDATAS[name].table}".${e}`);                            
                    element.groupBy.push(`"${_DBDATAS[name].table}"."id"`);
                    element.groupBy.push(`"${_DBDATAS[name].table}"."resultnumber"`,`"${_DBDATAS[name].table}"."datastream_id"`, `"${_DBDATAS[name].table}"."resultnumbers"`,`"${_DBDATAS[name].table}"."multidatastream_id"`);
            }
        }
    }
    return returnValue;
}