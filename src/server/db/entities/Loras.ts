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
 import { IReturnResult } from "../../types";
 
 export class Loras extends Common {
     constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
         super(ctx, knexInstance);
     }

     decodeLoraPayload = async (knexInstance: Knex | Knex.Transaction, loraDeveui: string, input: string): Promise<{[key: string]: string}> => {
        message(true, "INFO", "decodeLoraPayload", loraDeveui);
        return await knexInstance(_DBDATAS.Decoders.table).select("code").whereRaw(`id = (SELECT "decoder_id" FROM "${_DBDATAS.Loras.table}" WHERE "deveui" = '${loraDeveui}')`).first().then((res: any) => {
            try {
                if (res) {
                    const F = new Function("input", String(res.code));
                    return F(input);
                }
                return {"error" : "decoder error"};            
            } catch (error) {
                logDebug(error);           
            }
        });
    };

     async decodeLoraValues(knexInstance: Knex | Knex.Transaction, loraDeveui: string, input: any): Promise<{[key: string]: string}>  {       
        message(true, "INFO", "decodeLoraValues", loraDeveui);
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
        message(true, "OVERRIDE", this.constructor.name, "add");
        function getDate(): string | undefined {
            if (dataInput["datetime"]) return String(dataInput["datetime"]);
            if (dataInput["timestamp"]) return String(dataInput["timestamp"]);
         }

         if (dataInput["MultiDatastream"]) {
            if (!dataInput["deveui"] || dataInput["deveui"] == null) {
                const errorMessage = "deveui is missing or Null";
                if (silent) return this.createReturnResult({ body: errorMessage });
                else this.ctx.throw(400, { code: 400,  detail: errorMessage });
            }
            return await super.add(dataInput);
         }
         if (dataInput["Datastream"]) {
            if (!dataInput["deveui"] || dataInput["deveui"] == null) {
                const errorMessage = "deveui is missing or Null";
                if (silent) return this.createReturnResult({ body: errorMessage });
                else this.ctx.throw(400, { code: 400,  detail: errorMessage });
            }
            return await super.add(dataInput);
         }
        if (!dataInput["deveui"] || dataInput["deveui"] == null) {
            const errorMessage = "deveui is missing or Null";
            if (silent) return this.createReturnResult({ body: errorMessage });
            else this.ctx.throw(400, { code: 400,  detail: errorMessage });
        }

        if (!dataInput["data"] || dataInput["data"] == null) {
            if (dataInput["payload_deciphered"] && dataInput["payload_deciphered"] != "") {
                const decodeRaw = await this.decodeLoraPayload(Common.dbContext, dataInput["deveui"], dataInput["payload_deciphered"]);            
                if (decodeRaw.error) {
                   if (silent) return this.createReturnResult({ body: decodeRaw.error });
                   else this.ctx.throw(404, { code: 404,  detail: decodeRaw.error });
                }
                dataInput["data"] = decodeRaw["messages"];
            }
            const errorMessage = "Data is missing or Null";
            if (silent) return this.createReturnResult({ body: errorMessage });
            else this.ctx.throw(400, { code: 400,  detail: errorMessage });
        } else {
            const decodeValue = await this.decodeLoraValues(Common.dbContext, dataInput["deveui"], dataInput["data"]);   
            if (!decodeValue.error) dataInput["data"] = decodeValue;                
        }
         const searchMulti = `(select jsonb_agg(tmp.units -> 'name') as keys from ( select jsonb_array_elements("unitOfMeasurements") as units ) as tmp) FROM "${
             _DBDATAS.MultiDatastreams.table
         }" WHERE "${_DBDATAS.MultiDatastreams.table}".id = (SELECT "${_DBDATAS.Loras.table}"."multidatastream_id" FROM "${_DBDATAS.Loras.table}" WHERE "${_DBDATAS.Loras.table}"."deveui" = '${dataInput["deveui"]}')`;
         // Get the multiDatastream
         
         const tempSql = await Common.dbContext.raw(`SELECT id, thing_id, ${searchMulti}`);
         const multiDatastream = tempSql.rows[0];
         let datastream = undefined;
 
         if (!multiDatastream) {
            const tempSql = await Common.dbContext.raw(`SELECT id, thing_id FROM "${_DBDATAS.Datastreams.table}" WHERE "${_DBDATAS.Datastreams.table}".id = (SELECT "${_DBDATAS.Loras.table}"."datastream_id" FROM "${_DBDATAS.Loras.table}" WHERE "${_DBDATAS.Loras.table}"."deveui" = '${dataInput["deveui"]}')`);
            datastream = tempSql.rows[0];
            if (!datastream) {
                const errorMessage = `No datastream or multiDatastream found for deveui ${dataInput["deveui"]}`;
                if (silent) return this.createReturnResult({ body: errorMessage });
                else this.ctx.throw(404, { code: 404,  detail: errorMessage });
            }
         }
 
         // convert all keys in lowercase
         dataInput["data"] = Object.keys(dataInput["data"]).reduce((destination, key) => {
             destination[key.toLowerCase()] = dataInput["data"][key];
             return destination;
         }, {});
 
         if (multiDatastream) { 
            message(true, "DEBUG", "multiDatastream", multiDatastream);

            const listOfSortedValues: number | null[] = [];
            
            multiDatastream.keys.forEach((element: string) => {                 
                const searchStr = element
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");
                    if (dataInput["data"][searchStr]) listOfSortedValues.push(dataInput["data"][searchStr]);
                    else  Object.keys(dataInput["data"]).forEach((pipo: string) => {
                        if (element.toUpperCase().includes(pipo.toUpperCase())) listOfSortedValues.push(dataInput["data"][pipo]);
                    });
            }); 

            message(true, "DEBUG", "Values", listOfSortedValues);
     
             // If all datas null
             if (listOfSortedValues.filter((word) => word != null).length < 1) {
                 const errorMessage = `Data not corresponding [${multiDatastream.keys}]`;
                 if (silent) return this.createReturnResult({ body: errorMessage });
                 else this.ctx.throw(400, { code: 400,  detail: errorMessage });
             }
     
             if (listOfSortedValues.filter((word) => word != null).length < 1) {
                 const errorMessage = "No Data correspondence found";
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
                 const errorMessage = "No featureofinterest found";
                 if (silent) return this.createReturnResult({ body: errorMessage });
                 else this.ctx.throw(400, { code: 400,  detail: errorMessage });
             }
     
             const temp = listOfSortedValues;
     
             if (temp && typeof temp == "object") {
                 const tempLength = Object.keys(temp).length;
     
                 message(true, "DEBUG", "data : Keys", `${tempLength} : ${multiDatastream.keys.length}`);
                 if (tempLength != multiDatastream.keys.length) {
                     const errorMessage = `Size of list of results (${tempLength}) is not equal to size of keys (${multiDatastream.keys.length})`;
                     if (silent) return this.createReturnResult({ body: errorMessage });
                     else this.ctx.throw(400, { code: 400,  detail: errorMessage });
                    }
                }
            
     
             const insertObject = {
                 "featureofinterest_id": "(select featureofinterest1.id from featureofinterest1)",
                 "multidatastream_id": "(select multidatastream1.id from multidatastream1)",
                 "phenomenonTime": `to_timestamp('${dataInput["timestamp"]}','YYYY-MM-DD HH24:MI:SS')::timestamp`,
                 "resultTime": `to_timestamp('${dataInput["timestamp"]}','YYYY-MM-DD HH24:MI:SS')::timestamp`,
                 "_resultnumbers": `array ${removeQuotes(JSON.stringify(listOfSortedValues))}`
             };
     
             let searchDuplicate = "";
             Object.keys(insertObject)
                 .slice(0, -1)
                 .forEach((elem: string) => {
                     searchDuplicate = searchDuplicate.concat(`"${elem}" = ${insertObject[elem]} AND `);
                 });
     
             searchDuplicate = searchDuplicate.concat(
                 `"_resultnumbers" = '{${listOfSortedValues
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
                                 AND (select id from multidatastream1) IS NOT NULL
                                 RETURNING *, _resultnumber AS result)
                 , result1 as (select (select observation1.id from  observation1)
                 , (select multidatastream1."keys" from multidatastream1)
                 , (select searchDuplicate.id as duplicate from  searchDuplicate)
                 , ${this.createListQuery(
                     Object.keys(insertObject),
                     "(select observation1.COLUMN from  observation1), "
                 )} (select multidatastream1.id from  multidatastream1) as multidatastream, (select multidatastream1.thing_id from multidatastream1) as thing)
                  SELECT coalesce(json_agg(t), '[]') AS result FROM result1 as t`;
     
     
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
                         const errorMessage = "Observation already exist";
                         if (silent) return this.createReturnResult({ body: errorMessage });
                         else this.ctx.throw(409, { code: 409, detail: errorMessage, link: `${this.ctx._odata.options.rootBase}Observations(${[tempResult.duplicate]})` });
                     }
                 });
         } else if (datastream) { 
            message(true, "DEBUG", "datastream", datastream);

    
            const getFeatureOfInterest = getBigIntFromString(dataInput["FeatureOfInterest"]);
    
            const searchFOI = await Common.dbContext.raw(
                getFeatureOfInterest
                    ? `select coalesce((select "id" from "featureofinterest" where "id" = ${getFeatureOfInterest}), ${getFeatureOfInterest}) AS id `
                    : `SELECT id FROM ${_DBDATAS.FeaturesOfInterest.table} WHERE id = (SELECT _default_foi FROM "${_DBDATAS.Locations.table}" WHERE id = (SELECT location_id FROM ${_DBDATAS.ThingsLocations.table} WHERE thing_id = (SELECT thing_id FROM ${_DBDATAS.Datastreams.table} WHERE id =${datastream.id})))`
            );
    
            if (searchFOI["rows"].length < 1) {
                const errorMessage = "No featureofinterest found";
                if (silent) return this.createReturnResult({ body: errorMessage });
                else this.ctx.throw(400, { code: 400,  detail: errorMessage });
            }
            // dataInput["data"] = adam(dataInput["data"]);
    
            message(true, "DEBUG", "value", dataInput["data"]);

            const dataDate = getDate();
            if (!dataDate) {
                const errorMessage = "No valid date found";
                if (silent) return this.createReturnResult({ body: errorMessage });
                else this.ctx.throw(400, { code: 400,  detail: errorMessage });
            }            
            const insertObject = {
                "featureofinterest_id": "(select featureofinterest1.id from featureofinterest1)",
                "datastream_id": "(select datastream1.id from datastream1)",
                "phenomenonTime": `to_timestamp('${dataDate}','YYYY-MM-DD HH24:MI:SS')::timestamp`,
                "resultTime": `to_timestamp('${dataDate}','YYYY-MM-DD HH24:MI:SS')::timestamp`,
                "_resultnumber": `${dataInput["data"]["value"]}`
            };
    

            
            let searchDuplicate = "";
            Object.keys(insertObject)
                .slice(0, -1)
                .forEach((elem: string) => {
                    searchDuplicate = searchDuplicate.concat(`"${elem}" = ${insertObject[elem]} AND `);
                });
                searchDuplicate = searchDuplicate.concat(
                    `"_resultnumber" = ${dataInput["data"]["value"]}`
                );
                message(true, "DEBUG", "searchDuplicate", searchDuplicate);
    
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
                                RETURNING *, _resultnumber AS result)
                , result1 as (select (select observation1.id from  observation1)
                , (select searchDuplicate.id as duplicate from  searchDuplicate)
                , ${this.createListQuery(
                    Object.keys(insertObject),
                    "(select observation1.COLUMN from  observation1), "
                )} (select datastream1.id from datastream1) as datastream, (select datastream1.thing_id from datastream1) as thing)
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
                            result: tempResult._resultnumber
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
                        const errorMessage = "Observation already exist";
                        if (silent) return this.createReturnResult({ body: errorMessage });
                        else this.ctx.throw(409, { code: 409, detail: errorMessage, link: `${this.ctx._odata.options.rootBase}Observations(${[tempResult.duplicate]})` });
                    }
                });
        }


     }
 
     async update(idInput: bigint | string, dataInput: Object | undefined): Promise<IReturnResult | undefined> {
         message(true, "OVERRIDE", this.constructor.name, "update");
         return undefined;
     }
 }
 