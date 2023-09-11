/**getBigIntFromString
 * Loras entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
*
*/

import { Knex } from "knex";
import koa from "koa";
import { Common } from "./common";
import { getBigIntFromString, notNull, removeQuotes } from "../../helpers/index";
import { DOUBLEQUOTE, QUOTEDCOMA, VOIDTABLE } from "../../constants";
import { Logs } from "../../logger";
import { IKeyString, IreturnResult } from "../../types";
import { errors, msg } from "../../messages/";
import { EdatesType } from "../../enums";

export class Loras extends Common {
    synonym: object = {};
    constructor(ctx: koa.Context) {
         super(ctx);
    }

    async prepareInputResult(dataInput: object): Promise<object> {
        Logs.whereIam(); 
        ["deveui", "DevEUI", "sensor_id", "payload_deciphered"].forEach((key: string) => {
            if (dataInput[key]) dataInput[key] = dataInput[key].toUpperCase();
        });
        const result = {};
        Object.entries(dataInput).forEach(([k, v]) => {result[k.toLocaleLowerCase()] = v;});
        if(!isNaN(dataInput["timestamp"])) result["timestamp"] = new Date( dataInput["timestamp"]*1000).toISOString();
        return result;    
    }

    async decodeLoraValues(knexInstance: Knex | Knex.Transaction, loraDeveui: string, input: JSON): Promise<IKeyString> {               
       Logs.debug("decodeLoraValues", loraDeveui);
       try {
           return await knexInstance(this.DBST.Decoders.table).select("code").whereRaw(`id = (SELECT "decoder_id" FROM "${this.DBST.Loras.table}" WHERE "deveui" = '${loraDeveui}')`).first().then((res: object) => {
               if (res) {
                   try {
                       const F = new Function("input", String(res["code"]));                       
                       return F(input);
                   } catch (error) {
                       return {"error" : errors.decoderError};            
                   }
               }          
           });
       } catch (error) {
           Logs.error(error);           
       }
       return {"error" : errors.decoderError};            
   }

    createListQuery(input: string[], columnListString: string): string {
        const tempList = columnListString.split("COLUMN");
        return tempList[0].concat(DOUBLEQUOTE, input.join(`"${tempList[1]}${tempList[0]}"`), DOUBLEQUOTE, tempList[1]);
    }

    async add(dataInput: object, silent?: boolean): Promise<IreturnResult | undefined> {
        Logs.whereIam();    
        if (dataInput) dataInput = await this.prepareInputResult(dataInput);

        const decodeLoraPayload = async (knexInstance: Knex | Knex.Transaction, loraDeveui: string, input: string): Promise<any> => {
            Logs.debug(`decodeLoraPayload deveui : [${loraDeveui}]`, input);
            return await knexInstance(this.DBST.Decoders.table).select("code", "nomenclature", "synonym", "dataKeys").whereRaw(`id = (SELECT "decoder_id" FROM "${this.DBST.Loras.table}" WHERE "deveui" = '${loraDeveui}')`).first().then((res: any) => {
                if (res) {     
                    try {
                        this.synonym = res.synonym ? res.synonym : {};
                        const F = new Function("input", `${String(res.code)}; const nomenclature = ${JSON.stringify(res.nomenclature)}; return decode(input, nomenclature);`);                   
                        return F(input);
                    } catch (error) {
                        if (res.dataKeys) { 
                            let temp: object | undefined = undefined;
                            res.dataKeys.forEach((key: string) => {
                                if (dataInput["data"][key]) 
                                temp = { messages : [ {"measurementValue" : dataInput["data"][key]}] }; 
                            });
                            if (temp) return temp;
                        }
                        return {"error" : errors.DecodingPayloadError};         
                    }
                }
                return {"error" : errors.DecodingPayloadError};            
            });
        };


        function getDate(): string | undefined {
            if (dataInput["datetime"]) return String(dataInput["datetime"]);
            const essai = new Date( dataInput["timestamp"]*1000);
            if (dataInput["timestamp"]) return String(essai);
        }

        if (notNull(dataInput["MultiDatastream"])) {
           if (!notNull(dataInput["deveui"])) {
               if (silent) 
                    return this.createReturnResult({ body: errors.deveuiMessage });
                    else this.ctx.throw(400, { code: 400, detail: errors.deveuiMessage });
           }
           return await super.add(dataInput);
        }

        if (notNull(dataInput["Datastream"])) {
            if (!notNull(dataInput["deveui"])) {
               if (silent) 
                    return this.createReturnResult({ body: errors.deveuiMessage });
                    else this.ctx.throw(400, { code: 400, detail: errors.deveuiMessage });
           }
           return await super.add(dataInput);
        }
        
        if (!notNull(dataInput["deveui"])) {
            if (silent) 
                return this.createReturnResult({ body: errors.deveuiMessage });
                else this.ctx.throw(400, { code: 400, detail: errors.deveuiMessage });
        }
        
        if (notNull(dataInput["payload_deciphered"])) {
            dataInput["decodedPayload"] = await decodeLoraPayload(Common.dbContext, dataInput["deveui"], dataInput["payload_deciphered"]);
                     
            if (dataInput["decodedPayload"].error && !dataInput["data"]) {
                if (silent) 
                    return this.createReturnResult({ body: dataInput["decodedPayload"].error });
                    else this.ctx.throw(400, { code: 400, detail: dataInput["decodedPayload"].error });
            }
        }

        const searchMulti = `(SELECT jsonb_agg(tmp.units -> 'name') AS keys 
                                FROM ( SELECT jsonb_array_elements("unitOfMeasurements") AS units ) AS tmp) 
                                    FROM "${ this.DBST.MultiDatastreams.table }" 
                                    WHERE "${this.DBST.MultiDatastreams.table}".id = (
                                        SELECT "${this.DBST.Loras.table}"."multidatastream_id" 
                                        FROM "${this.DBST.Loras.table}" 
                                        WHERE "${this.DBST.Loras.table}"."deveui" = '${dataInput["deveui"]}')`;

        const tempSql = await Common.dbContext.raw(`SELECT id, _default_foi, thing_id, ${searchMulti}`);
        const multiDatastream = tempSql.rows[0];
        let datastream = undefined;
        
        if (!multiDatastream) {
            const tempSql = await Common.dbContext.raw(`SELECT id, _default_foi, thing_id FROM "${this.DBST.Datastreams.table}" WHERE "${this.DBST.Datastreams.table}".id = (SELECT "${this.DBST.Loras.table}"."datastream_id" FROM "${this.DBST.Loras.table}" WHERE "${this.DBST.Loras.table}"."deveui" = '${dataInput["deveui"]}')`);
            datastream = tempSql.rows[0];
           if (!datastream) {
               const errorMessage = errors.noStreamDeveui + dataInput["deveui"];
               if (silent) return this.createReturnResult({ body: errorMessage });
               else this.ctx.throw(404, { code: 404, detail: errorMessage });
           }
        }

        dataInput["formatedDatas"] = {};
        // convert all keys in lowercase
        if (notNull(dataInput["data"])) Object.keys(dataInput["data"]).forEach((key) => {
            dataInput["formatedDatas"][key.toLowerCase()] = dataInput["data"][key];
        });

        if (!notNull(dataInput["formatedDatas"])) {
            if (silent) 
                 return this.createReturnResult({ body: errors.dataMessage });
                 else this.ctx.throw(400, { code: 400, detail: errors.dataMessage });
        }
        
        dataInput["date"] = getDate();
        if (!dataInput["date"]) {
            if (silent) 
                return this.createReturnResult({ body: errors.noValidDate });
                else this.ctx.throw(400, { code: 400, detail: errors.noValidDate });
            }
            
        if (multiDatastream) { 
           Logs.debug("multiDatastream", multiDatastream);
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

           Logs.debug("Values", listOfSortedValues);
    
            // If all datas null
            if (Object.values(listOfSortedValues).filter((word) => word != null).length < 1) {
                const errorMessage = `${errors.dataNotCorresponding} [${multiDatastream.keys}]`;
                if (silent) return this.createReturnResult({ body: errorMessage });
                else this.ctx.throw(400, { code: 400, detail: errorMessage });
            }
    
            const getFeatureOfInterest = getBigIntFromString(dataInput["FeatureOfInterest"]);
            
            const temp = listOfSortedValues;
            if (temp && typeof temp == "object") {
                const tempLength = Object.keys(temp).length;
    
                Logs.debug("data : Keys", `${tempLength} : ${multiDatastream.keys.length}`);
                if (tempLength != multiDatastream.keys.length) {
                    const errorMessage = msg(errors.sizeListKeys, String(tempLength), multiDatastream.keys.length);
                    if (silent) return this.createReturnResult({ body: errorMessage });
                    else this.ctx.throw(400, { code: 400, detail: errorMessage });
                   }
               }
    
            const insertObject = {
                "featureofinterest_id":
                getFeatureOfInterest
                        ? `select coalesce((select "id" from "featureofinterest" where "id" = ${getFeatureOfInterest}), ${getFeatureOfInterest})`
                        : `(select multidatastream1._default_foi from multidatastream1)`,
                "multidatastream_id": "(select multidatastream1.id from multidatastream1)",
                "phenomenonTime": `to_timestamp('${dataInput["timestamp"]}','${EdatesType.dateWithOutTimeZone}')::timestamp`,
                "resultTime": `to_timestamp('${dataInput["timestamp"]}','${EdatesType.dateWithOutTimeZone}')::timestamp`,
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
                    .join(",")}}'::${this.ctx._config.highPrecision ? 'float8' : 'float4'}[]`
            );

            const sql = `WITH "${VOIDTABLE}" as (select srid FROM "${VOIDTABLE}" LIMIT 1)
                , multidatastream1 AS (SELECT id, thing_id, _default_foi, ${searchMulti} LIMIT 1)
                , myValues ( "${Object.keys(insertObject).join(QUOTEDCOMA)}") AS (values (${Object.values(insertObject).join()}))
                , searchDuplicate as (SELECT * FROM "${this.DBST.Observations.table}" WHERE ${searchDuplicate})
                , observation1 AS (INSERT INTO  "${this.DBST.Observations.table}" ("${Object.keys(insertObject).join(QUOTEDCOMA)}") SELECT * FROM myValues
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
    
            this.logQuery(sql);
            return await Common.dbContext
                .raw(sql)
                .then(async (res: any) => {
                    const tempResult = res["rows"][0].result[0];
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
    
                        Object.keys(this.DBST["Observations"].relations).forEach((word) => {
                            result[`${word}@iot.navigationLink`] = `${this.ctx._odata.options.rootBase}Observations(${tempResult.id})/${word}`;
                        });
    
                        return this.createReturnResult({
                            body: result,
                            query: sql
                        });
                    } else {                    
                       //  return await duplicate(tempResult.duplicate);
                        if (silent) return this.createReturnResult({ body: errors.observationExist });
                        else this.ctx.throw(409, { code: 409, detail: errors.observationExist, link: `${this.ctx._odata.options.rootBase}Observations(${[tempResult.duplicate]})` });
                    }
                });
        } else if (datastream) { 
           Logs.debug("datastream", datastream);
           const getFeatureOfInterest = getBigIntFromString(dataInput["FeatureOfInterest"]);
           const searchFOI = await Common.dbContext.raw(
               getFeatureOfInterest
                   ? `SELECT coalesce((SELECT "id" FROM "featureofinterest" WHERE "id" = ${getFeatureOfInterest}), ${getFeatureOfInterest}) AS id `
                   : `SELECT id FROM ${this.DBST.FeaturesOfInterest.table} WHERE id = (SELECT _default_foi FROM "${this.DBST.Locations.table}" WHERE id = (SELECT location_id FROM ${this.DBST.ThingsLocations.table} WHERE thing_id = (SELECT thing_id FROM ${this.DBST.Datastreams.table} WHERE id =${datastream.id})))`
           );
   
           if (searchFOI["rows"].length < 1) {
               if (silent) 
                    return this.createReturnResult({ body: errors.noFoi });
                    else this.ctx.throw(400, { code: 400, detail: errors.noFoi });
           }

           const value = dataInput["decodedPayload"]["measurementValue"] 
                ? dataInput["decodedPayload"]["measurementValue"] 
                : dataInput["decodedPayload"]["messages"][0]["measurementValue"] 
                    ? dataInput["decodedPayload"]["messages"][0]["measurementValue"]
                    : undefined;

            if (!value) {
                if (silent) 
                    return this.createReturnResult({ body: errors.noValue });
                    else this.ctx.throw(400, { code: 400, detail: errors.noValue });
            }
            
           const insertObject = {
               "featureofinterest_id": "(select datastream1._default_foi from datastream1)",
               "datastream_id": "(select datastream1.id from datastream1)",
               "phenomenonTime": `to_timestamp('${dataInput["date"]}','${EdatesType.dateWithOutTimeZone}')::timestamp`,
               "resultTime": `to_timestamp('${dataInput["date"]}}','${EdatesType.dateWithOutTimeZone}')::timestamp`,
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
               Logs.debug("searchDuplicate", searchDuplicate);
   
           const sql = `WITH "${VOIDTABLE}" as (select srid FROM "${VOIDTABLE}" LIMIT 1)
               , datastream1 AS (SELECT id, _default_foi, thing_id FROM "${this.DBST.Datastreams.table}" WHERE id =${datastream.id})
               , myValues ( "${Object.keys(insertObject).join(QUOTEDCOMA)}") AS (values (${Object.values(insertObject).join()}))
               , searchDuplicate as (SELECT * FROM "${this.DBST.Observations.table}" WHERE ${searchDuplicate})
               , observation1 AS (INSERT INTO  "${this.DBST.Observations.table}" ("${Object.keys(insertObject).join(QUOTEDCOMA)}") SELECT * FROM myValues
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
                   const tempResult = res["rows"][0].result[0];
                   if (tempResult.id != null) {
                       const result = {
                           "@iot.id": tempResult.id,
                           "@iot.selfLink": `${this.ctx._odata.options.rootBase}Observations(${tempResult.id})`,
                           "phenomenonTime": `"${tempResult.phenomenonTime}"`,
                           "resultTime": `"${tempResult.resultTime}"`,
                           result: tempResult._resultnumbers
                       };
   
                       Object.keys(this.DBST["Observations"].relations).forEach((word) => {
                           result[`${word}@iot.navigationLink`] = `${this.ctx._odata.options.rootBase}Observations(${tempResult.id})/${word}`;
                       });
   
                       return this.createReturnResult({
                           body: result,
                           query: sql
                       });
                   } else {                    
                      //  return await duplicate(tempResult.duplicate);
                       if (silent) return this.createReturnResult({ body: errors.observationExist });
                       else this.ctx.throw(409, { code: 409, detail: errors.observationExist, link: `${this.ctx._odata.options.rootBase}Observations(${[tempResult.duplicate]})` });
                   }
               });
       }
    }

    async update(idInput: bigint | string, dataInput: object | undefined): Promise<IreturnResult | undefined> {
        Logs.whereIam(); 
        return undefined;
    }
}
