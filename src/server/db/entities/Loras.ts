/**
 * Loras entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
*
*/

import { Knex } from "knex";
import koa from "koa";
import { Common } from "./common";
import { getBigIntFromString, removeQuotes } from "../../helpers/index";
import {  _DBDATAS } from "../constants";
import { _DOUBLEQUOTE, _QUOTEDCOMA, _VOIDTABLE } from "../../constants";
import { logDebug, message } from "../../logger";
import { IReturnResult, MODES } from "../../types";
import { messages, messagesReplace } from "../../messages/";



const notNull = (input: any): boolean => {
    switch (typeof input) {
        case "string":
            if(input && input != "" && input != null) return true;
        case "object":
            if(input && Object.keys(input).length > 0) return true;    
        default:
            return false;
    }
    
}

export class Loras extends Common {
    synonym: object = {};
    constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
        super(ctx, knexInstance);
    }
    async prepareInputResult(dataInput: Object): Promise<Object> {
        message(true, MODES.CLASS, this.constructor.name, "prepareInputResult"); 
        ["deveui", "sensor_id", "payload_deciphered"].forEach((key: string) => {
            if (dataInput[key]) dataInput[key] = dataInput[key].toUpperCase();
        });
        return dataInput;    
    }
    // load decoder and decode payload with the code


    async decodeLoraValues(knexInstance: Knex | Knex.Transaction, loraDeveui: string, input: any): Promise<{[key: string]: string}>  {   
            
       message(true, MODES.INFO, "decodeLoraValues", loraDeveui);
       try {
           return await knexInstance(_DBDATAS.Decoders.table).select("code").whereRaw(`id = (SELECT "decoder_id" FROM "${_DBDATAS.Loras.table}" WHERE "deveui" = '${loraDeveui}')`).first().then((res: any) => {
               if (res) {
                   try {
                       const F = new Function("input", String(res.code));                       
                       return F(input);
                   } catch (error) {
                       return {"error" : "decoder error"};            
                   }
               }
               return {"error" : "decoder error"};            
           });
       } catch (error) {
           logDebug(error);           
       }
       return {"error" : "decoder error"};            
   };

    createListQuery(input: string[], columnListString: string): string {
        const tempList = columnListString.split("COLUMN");
        return tempList[0].concat(_DOUBLEQUOTE, input.join(`"${tempList[1]}${tempList[0]}"`), _DOUBLEQUOTE, tempList[1]);
    }

    async add(dataInput: Object, silent?: boolean): Promise<IReturnResult | undefined> {
        message(true, MODES.OVERRIDE, messagesReplace(messages.infos.classConstructor, [this.constructor.name, `add`]));    
        if (dataInput) dataInput = await this.prepareInputResult(dataInput);

        const decodeLoraPayload = async (knexInstance: Knex | Knex.Transaction, loraDeveui: string, input: string): Promise<any> => {
            message(true, MODES.INFO, `decodeLoraPayload deveui : [${loraDeveui}]`, input);
            const ErrorMessage = "Decoding Payload error";
            return await knexInstance(_DBDATAS.Decoders.table).select("code", "nomenclature", "synonym", "dataKeys").whereRaw(`id = (SELECT "decoder_id" FROM "${_DBDATAS.Loras.table}" WHERE "deveui" = '${loraDeveui}')`).first().then((res: any) => {
                try {
                    if (res) {     
                        this.synonym = res.synonym ? res.synonym : {};
                        const F = new Function("input", `${String(res.code)}; const nomenclature = ${JSON.stringify(res.nomenclature)}; return decode(input, nomenclature);`);                   
                        const temp =  F(input);
                        return temp;
                    }
                 } catch (error) {
                     if (res.dataKeys) { 
                        let temp: object | undefined = undefined;
                        res.dataKeys.forEach((key: string) => {
                            if (dataInput["data"][key]) 
                                temp = { messages : [ {"measurementValue" : dataInput["data"][key]}] }; 
                        });
                        if (temp) return temp;
                     }
                     return {"error" : ErrorMessage};         
                 }
                 return {"error" : ErrorMessage};            
            });
        };


        function getDate(): string | undefined {
            if (dataInput["datetime"]) return String(dataInput["datetime"]);
            if (dataInput["timestamp"]) return String(dataInput["timestamp"]);
        }

        if (notNull(dataInput["MultiDatastream"])) {
           if (!notNull(dataInput["deveui"])) {
               if (silent) 
                    return this.createReturnResult({ body: messages.errors.deveuiMessage });
                    else this.ctx.throw(400, { code: 400,  detail: messages.errors.deveuiMessage });
           }
           return await super.add(dataInput);
        }

        if (notNull(dataInput["Datastream"])) {
            if (!notNull(dataInput["deveui"])) {
               if (silent) 
                    return this.createReturnResult({ body: messages.errors.deveuiMessage });
                    else this.ctx.throw(400, { code: 400,  detail: messages.errors.deveuiMessage });
           }
           return await super.add(dataInput);
        }
        
        if (!notNull(dataInput["deveui"])) {
            if (silent) 
                return this.createReturnResult({ body: messages.errors.deveuiMessage });
                else this.ctx.throw(400, { code: 400,  detail: messages.errors.deveuiMessage });
        }
        
        if (notNull(dataInput["payload_deciphered"])) {
            dataInput["decodedPayload"] = await decodeLoraPayload(Common.dbContext, dataInput["deveui"], dataInput["payload_deciphered"]);
                     
            if (dataInput["decodedPayload"].error && !dataInput["data"]) {
                if (silent) 
                    return this.createReturnResult({ body: dataInput["decodedPayload"].error });
                    else this.ctx.throw(400, { code: 400,  detail: dataInput["decodedPayload"].error });
            };
        }

        const searchMulti = `(SELECT jsonb_agg(tmp.units -> 'name') AS keys 
                                FROM ( SELECT jsonb_array_elements("unitOfMeasurements") AS units ) AS tmp) 
                                    FROM "${ _DBDATAS.MultiDatastreams.table }" 
                                    WHERE "${_DBDATAS.MultiDatastreams.table}".id = (
                                        SELECT "${_DBDATAS.Loras.table}"."multidatastream_id" 
                                        FROM "${_DBDATAS.Loras.table}" 
                                        WHERE "${_DBDATAS.Loras.table}"."deveui" = '${dataInput["deveui"]}')`;

        const tempSql = await Common.dbContext.raw(`SELECT id, thing_id, ${searchMulti}`);
        const multiDatastream = tempSql.rows[0];
        let datastream = undefined;
        
        if (!multiDatastream) {
            const tempSql = await Common.dbContext.raw(`SELECT id, thing_id FROM "${_DBDATAS.Datastreams.table}" WHERE "${_DBDATAS.Datastreams.table}".id = (SELECT "${_DBDATAS.Loras.table}"."datastream_id" FROM "${_DBDATAS.Loras.table}" WHERE "${_DBDATAS.Loras.table}"."deveui" = '${dataInput["deveui"]}')`);
            datastream = tempSql.rows[0];
           if (!datastream) {
               const errorMessage = messages.errors.noStreamDeveui + dataInput["deveui"];
               if (silent) return this.createReturnResult({ body: errorMessage });
               else this.ctx.throw(404, { code: 404,  detail: errorMessage });
           }
        }

        dataInput["formatedDatas"] = {};
        // convert all keys in lowercase
        if (notNull(dataInput["data"])) Object.keys(dataInput["data"]).forEach((key) => {
            dataInput["formatedDatas"][key.toLowerCase()] = dataInput["data"][key];
        });

        if (!notNull(dataInput["formatedDatas"])) {
            if (silent) 
                 return this.createReturnResult({ body: messages.errors.dataMessage });
                 else this.ctx.throw(400, { code: 400,  detail: messages.errors.dataMessage });
        }
        
        dataInput["date"] = getDate();
        if (!dataInput["date"]) {
            if (silent) 
                return this.createReturnResult({ body: messages.errors.noValidDate });
                else this.ctx.throw(400, { code: 400,  detail: messages.errors.noValidDate });
            }
            
        if (multiDatastream) { 
           message(true, MODES.DEBUG, "multiDatastream", multiDatastream);
           const listOfSortedValues: {[key: string]: number | null} = {};           
           multiDatastream.keys.forEach((element: string) => {  
               listOfSortedValues[element] = null;               
               const searchStr = element
               .toLowerCase()
               .normalize("NFD")
               .replace(/[\u0300-\u036f]/g, "");
               if (dataInput["formatedDatas"][searchStr]) listOfSortedValues[element] = dataInput["formatedDatas"][searchStr];
               else Object.keys(dataInput["formatedDatas"]).forEach((subElem: string) => {
                   if (element.toUpperCase().includes(subElem.toUpperCase())) listOfSortedValues[element] = dataInput["formatedDatas"][subElem];
                   else if(this.synonym[element]) this.synonym[element].forEach((key: string) => {
                       if (key.toUpperCase().includes(subElem.toUpperCase())) listOfSortedValues[element] = dataInput["formatedDatas"][subElem];
                    });
                }); 
           }); 

           message(true, MODES.DEBUG, "Values", listOfSortedValues);
    
            // If all datas null
            if (Object.values(listOfSortedValues).filter((word) => word != null).length < 1) {
                const errorMessage = `${messages.errors.dataNotCorresponding} [${multiDatastream.keys}]`;
                if (silent) return this.createReturnResult({ body: errorMessage });
                else this.ctx.throw(400, { code: 400,  detail: errorMessage });
            }
    
            const getFeatureOfInterest = getBigIntFromString(dataInput["FeatureOfInterest"]);

            const searchFOI = await Common.dbContext.raw(
                getFeatureOfInterest
                    ? `select coalesce((select "id" from "featureofinterest" where "id" = ${getFeatureOfInterest}), ${getFeatureOfInterest}) AS id `
                    : `SELECT id FROM ${_DBDATAS.FeaturesOfInterest.table} WHERE id = (SELECT _default_foi FROM "${_DBDATAS.Locations.table}" WHERE id = (SELECT location_id FROM ${_DBDATAS.ThingsLocations.table} WHERE thing_id = (SELECT thing_id FROM ${_DBDATAS.MultiDatastreams.table} WHERE id =${multiDatastream.id})))`
            );
    
            if (searchFOI["rows"].length < 1) {
                if (silent) return this.createReturnResult({ body: messages.errors.noFoi });
                else this.ctx.throw(400, { code: 400,  detail: messages.errors.noFoi });
            }
            const temp = listOfSortedValues;
            if (temp && typeof temp == "object") {
                const tempLength = Object.keys(temp).length;
    
                message(true, MODES.DEBUG, "data : Keys", `${tempLength} : ${multiDatastream.keys.length}`);
                if (tempLength != multiDatastream.keys.length) {
                    const errorMessage = messagesReplace(messages.errors.sizeListKeys, [String(tempLength), multiDatastream.keys.length]);
                    if (silent) return this.createReturnResult({ body: errorMessage });
                    else this.ctx.throw(400, { code: 400,  detail: errorMessage });
                   }
               }
    
            const insertObject = {
                "featureofinterest_id": "(select featureofinterest1.id from featureofinterest1)",
                "multidatastream_id": "(select multidatastream1.id from multidatastream1)",
                "phenomenonTime": `to_timestamp('${dataInput["timestamp"]}','YYYY-MM-DD HH24:MI:SS')::timestamp`,
                "resultTime": `to_timestamp('${dataInput["timestamp"]}','YYYY-MM-DD HH24:MI:SS')::timestamp`,
                "_resultnumbers": `array ${removeQuotes(JSON.stringify(Object.values(listOfSortedValues)))}`
            };
    
            let searchDuplicate = "";
            Object.keys(insertObject)
                .slice(0, -1)
                .forEach((elem: string) => {
                    searchDuplicate = searchDuplicate.concat(`"${elem}" = ${insertObject[elem]} AND `);
                });
    
            searchDuplicate = searchDuplicate.concat(
                `"_resultnumbers" = '{${Object.values(listOfSortedValues)
                    .map((elem) => {
                        const tmp = JSON.stringify(elem);
                        return tmp == "null" ? tmp : `${tmp}`;
                    })
                    .join(",")}}'::float8[]`
            );

            const sql = `WITH "${_VOIDTABLE}" as (select srid FROM "${_VOIDTABLE}" LIMIT 1)
                , featureofinterest1 AS (SELECT id FROM "${_DBDATAS.FeaturesOfInterest.table}"
                                         WHERE id = (SELECT _default_foi FROM "${_DBDATAS.Locations.table}" 
                                         WHERE id = (SELECT location_id FROM "${_DBDATAS.ThingsLocations.table}" 
                                         WHERE thing_id = (SELECT thing_id FROM "${_DBDATAS.MultiDatastreams.table}" 
                                         WHERE id =${multiDatastream.id}))))
                , multidatastream1 AS (SELECT id, thing_id, ${searchMulti} LIMIT 1)
                , myValues ( "${Object.keys(insertObject).join(_QUOTEDCOMA)}") AS (values (${Object.values(insertObject).join()}))
                , searchDuplicate as (SELECT * FROM "${_DBDATAS.Observations.table}" WHERE ${searchDuplicate})
                , observation1 AS (INSERT INTO  "${_DBDATAS.Observations.table}" ("${Object.keys(insertObject).join(_QUOTEDCOMA)}") SELECT * FROM myValues
                                WHERE NOT EXISTS (SELECT * FROM searchDuplicate)
                                AND (SELECT id FROM multidatastream1) IS NOT NULL
                                RETURNING *, _resultnumbers AS result)
                , result1 AS (SELECT (SELECT observation1.id FROM observation1)
                , (SELECT multidatastream1."keys" FROM multidatastream1)
                , (SELECT searchDuplicate.id AS duplicate FROM  searchDuplicate)
                , ${this.createListQuery(
                    Object.keys(insertObject),
                    "(SELECT observation1.COLUMN FROM observation1), "
                )} (SELECT multidatastream1.id FROM multidatastream1) AS multidatastream, (SELECT multidatastream1.thing_id FROM multidatastream1) AS thing)
                 SELECT coalesce(json_agg(t), '[]') AS result FROM result1 AS t`;            
    
            // const sql = `WITH "${_VOIDTABLE}" as (select srid FROM "${_VOIDTABLE}" LIMIT 1)
            //     , featureofinterest1 AS (SELECT id FROM "${_DBDATAS.FeaturesOfInterest.table}"
            //                              WHERE id = (SELECT _default_foi FROM "${_DBDATAS.Locations.table}" 
            //                              WHERE id = (SELECT location_id FROM "${_DBDATAS.ThingsLocations.table}" 
            //                              WHERE thing_id = (SELECT thing_id FROM "${_DBDATAS.MultiDatastreams.table}" 
            //                              WHERE id =${multiDatastream.id}))))
            //     , multidatastream1 AS (SELECT id, thing_id, ${searchMulti} LIMIT 1)
            //     , myValues ( "${Object.keys(insertObject).join(_QUOTEDCOMA)}") AS (values (${Object.values(insertObject).join()}))
            //     , searchDuplicate as (SELECT * FROM "${_DBDATAS.Observations.table}" WHERE ${searchDuplicate})
            //     , observation1 AS (INSERT INTO  "${_DBDATAS.Observations.table}" ("${Object.keys(insertObject).join(_QUOTEDCOMA)}") SELECT * FROM myValues
            //                     WHERE NOT EXISTS (SELECT * FROM searchDuplicate)
            //                     AND (SELECT id FROM multidatastream1) IS NOT NULL
            //                     RETURNING *, _resultnumbers AS result)
            //     , result1 AS ((SELECT observation1.id FROM observation1)
            //     , (select observation1._resultnumber from  observation1) AS result
            //     , (SELECT multidatastream1."keys" FROM multidatastream1)
            //     , (SELECT searchDuplicate.id AS duplicate FROM  searchDuplicate)
            //     , ${this.createListQuery(
            //         Object.keys(insertObject),
            //         "(SELECT observation1.COLUMN FROM observation1), "
            //     )} (SELECT multidatastream1.id FROM multidatastream1) AS multidatastream, (SELECT multidatastream1.thing_id FROM multidatastream1) AS thing)
            //      SELECT coalesce(json_agg(t), '[]') AS result FROM result1 AS t`;
    
            this.logQuery(sql);
            return await Common.dbContext
                .raw(sql)
                .then(async (res: any) => {
                    const tempResult = res.rows[0].result[0];
                    if (tempResult.id != null) {
                        const _resultnumbers = {};
                        tempResult.keys.forEach((elem: string, index: number) => {
                            _resultnumbers[elem] = tempResult["_resultnumbers"][index];
                        });
                        const result = {
                            "@iot.id": tempResult.id,
                            "@iot.selfLink": `${this.ctx._odata.options.rootBase}Observations(${tempResult.id})`,
                            "phenomenonTime": `"${tempResult.phenomenonTime}"`,
                            "resultTime": `"${tempResult.resultTime}"`,
                            result: _resultnumbers
                        };
    
                        Object.keys(_DBDATAS["Observations"].relations).forEach((word) => {
                            result[`${word}@iot.navigationLink`] = `${this.ctx._odata.options.rootBase}Observations(${tempResult.id})/${word}`;
                        });
    
                        return this.createReturnResult({
                            body: result,
                            query: sql
                        });
                    } else {                    
                       //  return await duplicate(tempResult.duplicate);
                        if (silent) return this.createReturnResult({ body: messages.errors.observationExist });
                        else this.ctx.throw(409, { code: 409, detail: messages.errors.observationExist, link: `${this.ctx._odata.options.rootBase}Observations(${[tempResult.duplicate]})` });
                    }
                });
        } else if (datastream) { 
           message(true, MODES.DEBUG, "datastream", datastream);
           const getFeatureOfInterest = getBigIntFromString(dataInput["FeatureOfInterest"]);
           const searchFOI = await Common.dbContext.raw(
               getFeatureOfInterest
                   ? `SELECT coalesce((SELECT "id" FROM "featureofinterest" WHERE "id" = ${getFeatureOfInterest}), ${getFeatureOfInterest}) AS id `
                   : `SELECT id FROM ${_DBDATAS.FeaturesOfInterest.table} WHERE id = (SELECT _default_foi FROM "${_DBDATAS.Locations.table}" WHERE id = (SELECT location_id FROM ${_DBDATAS.ThingsLocations.table} WHERE thing_id = (SELECT thing_id FROM ${_DBDATAS.Datastreams.table} WHERE id =${datastream.id})))`
           );
   
           if (searchFOI["rows"].length < 1) {
               if (silent) 
                    return this.createReturnResult({ body: messages.errors.noFoi });
                    else this.ctx.throw(400, { code: 400,  detail: messages.errors.noFoi });
           }

           const value = dataInput["decodedPayload"]["measurementValue"] 
                ? dataInput["decodedPayload"]["measurementValue"] 
                : dataInput["decodedPayload"]["messages"][0]["measurementValue"] 
                    ? dataInput["decodedPayload"]["messages"][0]["measurementValue"]
                    : undefined;

            if (!value)  {
                if (silent) 
                    return this.createReturnResult({ body: messages.errors.noValue });
                    else this.ctx.throw(400, { code: 400,  detail: messages.errors.noValue });
            }
            
           const insertObject = {
               "featureofinterest_id": "(select featureofinterest1.id from featureofinterest1)",
               "datastream_id": "(select datastream1.id from datastream1)",
               "phenomenonTime": `to_timestamp('${dataInput["date"]}','YYYY-MM-DD HH24:MI:SS')::timestamp`,
               "resultTime": `to_timestamp('${dataInput["date"]}}','YYYY-MM-DD HH24:MI:SS')::timestamp`,
               "_resultnumber": `${value}`
           };
           let searchDuplicate = "";

           Object.keys(insertObject)
               .slice(0, -1)
               .forEach((elem: string) => {
                   searchDuplicate = searchDuplicate.concat(`"${elem}" = ${insertObject[elem]} AND `);
               });
               searchDuplicate = searchDuplicate.concat(
                   `"_resultnumber" = ${insertObject["_resultnumber"]}`
               );
               message(true, MODES.DEBUG, "searchDuplicate", searchDuplicate);
   
           const sql = `WITH "${_VOIDTABLE}" as (select srid FROM "${_VOIDTABLE}" LIMIT 1)
               , featureofinterest1 AS (SELECT id FROM "${_DBDATAS.FeaturesOfInterest.table}"
                                        WHERE id = (SELECT _default_foi FROM "${_DBDATAS.Locations.table}" 
                                        WHERE id = (SELECT location_id FROM "${_DBDATAS.ThingsLocations.table}" 
                                        WHERE thing_id = (SELECT thing_id FROM "${_DBDATAS.Datastreams.table}" 
                                        WHERE id =${datastream.id}))))
               , datastream1 AS (SELECT id, thing_id FROM "${_DBDATAS.Datastreams.table}" WHERE id =${datastream.id})
               , myValues ( "${Object.keys(insertObject).join(_QUOTEDCOMA)}") AS (values (${Object.values(insertObject).join()}))
               , searchDuplicate as (SELECT * FROM "${_DBDATAS.Observations.table}" WHERE ${searchDuplicate})
               , observation1 AS (INSERT INTO  "${_DBDATAS.Observations.table}" ("${Object.keys(insertObject).join(_QUOTEDCOMA)}") SELECT * FROM myValues
                                WHERE NOT EXISTS (SELECT * FROM searchDuplicate)
                               AND (select id from datastream1) IS NOT NULL
                               RETURNING *)
               , result1 as (SELECT 
                    (SELECT observation1.id FROM observation1),
                    (SELECT searchDuplicate.id as duplicate FROM searchDuplicate),
                    ${this.createListQuery(
                        Object.keys(insertObject),
                        "(SELECT observation1.COLUMN from observation1), "
                    )} (SELECT datastream1.id from datastream1) as datastream, (select datastream1.thing_id from datastream1) as thing)
                SELECT coalesce(json_agg(t), '[]') AS result FROM result1 as t`;
   
   
           this.logQuery(sql);
           return await Common.dbContext
               .raw(sql)
               .then(async (res: any) => {
                   const tempResult = res.rows[0].result[0];
                   if (tempResult.id != null) {
                       const result = {
                           "@iot.id": tempResult.id,
                           "@iot.selfLink": `${this.ctx._odata.options.rootBase}Observations(${tempResult.id})`,
                           "phenomenonTime": `"${tempResult.phenomenonTime}"`,
                           "resultTime": `"${tempResult.resultTime}"`,
                           result: tempResult._resultnumbers
                       };
   
                       Object.keys(_DBDATAS["Observations"].relations).forEach((word) => {
                           result[`${word}@iot.navigationLink`] = `${this.ctx._odata.options.rootBase}Observations(${tempResult.id})/${word}`;
                       });
   
                       return this.createReturnResult({
                           body: result,
                           query: sql
                       });
                   } else {                    
                      //  return await duplicate(tempResult.duplicate);
                       if (silent) return this.createReturnResult({ body: messages.errors.observationExist });
                       else this.ctx.throw(409, { code: 409, detail: messages.errors.observationExist, link: `${this.ctx._odata.options.rootBase}Observations(${[tempResult.duplicate]})` });
                   }
               });
       }
    }

    async update(idInput: bigint | string, dataInput: Object | undefined): Promise<IReturnResult | undefined> {
        message(true, MODES.OVERRIDE, messagesReplace(messages.infos.classConstructor, [this.constructor.name, `update`]));
        return undefined;
    }
}
