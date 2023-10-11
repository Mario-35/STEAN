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
import { getBigIntFromString, notNull } from "../../helpers/index";
import { DOUBLEQUOTE, QUOTEDCOMA, VOIDTABLE } from "../../constants";
import { Logs } from "../../logger";
import { IKeyString, IreturnResult } from "../../types";
import { errors, msg } from "../../messages/";
import { EdatesType } from "../../enums";
import { queryMultiDatastreamFromDeveui } from "../queries";

export class Loras extends Common {
    synonym: object = {};
    stean: object = {};
    constructor(ctx: koa.Context) {
         super(ctx);
    }

    async prepareInputResult(dataInput: object): Promise<object> {
        Logs.whereIam();
        const result = {};
        const listKeys = ["deveui", "DevEUI", "sensor_id", "frame"];
        if (notNull(dataInput["payload_deciphered"])) this.stean["frame"] = dataInput["payload_deciphered"].toUpperCase();    
        Object.entries(dataInput).forEach(([k, v]) => result[listKeys.includes(k) ? k.toLowerCase() : k] = listKeys.includes(k) ? v.toUpperCase() : v);
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

        const addToStream = (key: string) => this.stean[key] = dataInput[key];
        
        if (dataInput) this.stean = await this.prepareInputResult(dataInput);

        const decodeLoraPayload = async (knexInstance: Knex | Knex.Transaction, loraDeveui: string, input: string): Promise<any> => {
            Logs.debug(`decodeLoraPayload deveui : [${loraDeveui}]`, input);
            return await knexInstance(this.DBST.Decoders.table).select("code", "nomenclature", "synonym", "dataKeys").whereRaw(`id = (SELECT "decoder_id" FROM "${this.DBST.Loras.table}" WHERE "deveui" = '${loraDeveui}')`).first().then((res: any) => {
                if (res) {     
                    try {
                        this.synonym = res.synonym ? res.synonym : {};                        
                        const F = new Function("input", "nomenclature", `${String(res.code)}; return decode(input, nomenclature);`);
                        return F(input, JSON.parse(res.nomenclature));
                    } catch (error) { 
                        console.log(error);                                               
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
                console.log("ne devrait pas etre ici");
                
                return {"error" : errors.DecodingPayloadError};            
            });
        };
        
        function gedataInputtDate(): string | undefined {
            if (dataInput["datetime"]) return String(dataInput["datetime"]);
            const tempDate = new Date( dataInput["timestamp"]*1000);
            if (dataInput["timestamp"]) return String(tempDate);
        }
 
        // search for MultiDatastream
        if (notNull(dataInput["MultiDatastream"])) {            
            if (!notNull(this.stean["deveui"])) {
                if (silent) 
                return this.createReturnResult({ body: errors.deveuiMessage });
                else this.ctx.throw(400, { code: 400, detail: errors.deveuiMessage });
            }   
            addToStream("MultiDatastream");
            return await super.add(this.stean);
        }
        
        // search for Datastream
        if (notNull(dataInput["Datastream"])) {
            if (!notNull(dataInput["deveui"])) {
               if (silent) 
                    return this.createReturnResult({ body: errors.deveuiMessage });
                    else this.ctx.throw(400, { code: 400, detail: errors.deveuiMessage });
           }
           addToStream("Datastream");         
           return await super.add(this.stean);
        }
        
        // search for deveui
        if (!notNull(this.stean["deveui"])) {
            if (silent) 
                return this.createReturnResult({ body: errors.deveuiMessage });
                else this.ctx.throw(400, { code: 400, detail: errors.deveuiMessage });
        }
        
        // search for frame and decode payload if found
        if (notNull(this.stean["frame"])) {
            this.stean["decodedPayload"] = await decodeLoraPayload(Common.dbContext, this.stean["deveui"], this.stean["frame"]);
                        if (this.stean["decodedPayload"].hasOwnProperty("error")) {
                if (silent) 
                return this.createReturnResult({ body: this.stean["decodedPayload"].error });
                    else this.ctx.throw(400, { code: 400, detail: this.stean["decodedPayload"].error });
                }
            if (this.stean["decodedPayload"].valid === false) this.ctx.throw(400, { code: 400, detail: errors.InvalidPayload });
        }

        const searchMulti = queryMultiDatastreamFromDeveui(this.stean["deveui"]);

        const tempSql = await Common.dbContext.raw(`SELECT id, _default_foi, thing_id, ${searchMulti}`);
        const multiDatastream = tempSql.rows[0];
        let datastream = undefined;
        
        if (!multiDatastream) {
            const tempSql = await Common.dbContext.raw(`SELECT id, _default_foi, thing_id FROM "${this.DBST.Datastreams.table}" WHERE "${this.DBST.Datastreams.table}".id = (SELECT "${this.DBST.Loras.table}"."datastream_id" FROM "${this.DBST.Loras.table}" WHERE "${this.DBST.Loras.table}"."deveui" = '${this.stean["deveui"]}')`);
            datastream = tempSql.rows[0];
           if (!datastream) {
               const errorMessage = errors.noStreamDeveui + this.stean["deveui"];
               if (silent) return this.createReturnResult({ body: errorMessage });
               else this.ctx.throw(404, { code: 404, detail: errorMessage });
           }
        }
        this.stean["formatedDatas"] = {};

        if (this.stean["decodedPayload"] && notNull(this.stean["decodedPayload"]["datas"])) Object.keys(this.stean["decodedPayload"]["datas"]).forEach((key) => {
            this.stean["formatedDatas"][key.toLowerCase()] = this.stean["decodedPayload"]["datas"][key];
        });


        // convert all keys in lowercase
        if (notNull(dataInput["data"])) Object.keys(dataInput["data"]).forEach((key) => {
            this.stean["formatedDatas"][key.toLowerCase()] = dataInput["data"][key];
        });

        if (!notNull(this.stean["formatedDatas"])) {
            if (silent) 
                 return this.createReturnResult({ body: errors.dataMessage });
                 else this.ctx.throw(400, { code: 400, detail: errors.dataMessage });
        }
        
        this.stean["date"] = gedataInputtDate();
        if (!this.stean["date"]) {
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
               if (this.stean["formatedDatas"][searchStr]) listOfSortedValues[element] = this.stean["formatedDatas"][searchStr];
               else Object.keys(this.stean["formatedDatas"]).forEach((subElem: string) => {
                   if (element.toUpperCase().includes(subElem.toUpperCase())) listOfSortedValues[element] = this.stean["formatedDatas"][subElem];
                   else if(this.synonym[element]) this.synonym[element].forEach((key: string) => {
                       if (key.toUpperCase().includes(subElem.toUpperCase())) listOfSortedValues[element] = this.stean["formatedDatas"][subElem];
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
    
               const resultCreate = `'${JSON.stringify({"value": listOfSortedValues, "payload": this.stean["frame"] })}'::jsonb`;
            const insertObject = {
                "featureofinterest_id":
                getFeatureOfInterest
                        ? `select coalesce((select "id" from "featureofinterest" where "id" = ${getFeatureOfInterest}), ${getFeatureOfInterest})`
                        : `(select multidatastream1._default_foi from multidatastream1)`,
                "multidatastream_id": "(select multidatastream1.id from multidatastream1)",
                "phenomenonTime": `to_timestamp('${this.stean["timestamp"]}','${EdatesType.dateWithOutTimeZone}')::timestamp`,
                "resultTime": `to_timestamp('${this.stean["timestamp"]}','${EdatesType.dateWithOutTimeZone}')::timestamp`,
                "result": resultCreate
            };
            
            const searchDuplicate = Object.keys(insertObject) .slice(0, -1) .map((elem: string) => `"${elem}" = ${insertObject[elem]} AND `).concat(`"result" = ${resultCreate}`).join("");

            const sql = `WITH "${VOIDTABLE}" AS (select srid FROM "${VOIDTABLE}" LIMIT 1)
                , multidatastream1 AS (SELECT id, thing_id, _default_foi, ${searchMulti} LIMIT 1)
                , myValues ( "${Object.keys(insertObject).join(QUOTEDCOMA)}") AS (values (${Object.values(insertObject).join()}))
                , searchDuplicate AS (SELECT * FROM "${this.DBST.Observations.table}" WHERE ${searchDuplicate})
                , observation1 AS (INSERT INTO  "${this.DBST.Observations.table}" ("${Object.keys(insertObject).join(QUOTEDCOMA)}") SELECT * FROM myValues
                                WHERE NOT EXISTS (SELECT * FROM searchDuplicate)
                                AND (SELECT id FROM multidatastream1) IS NOT NULL
                                RETURNING *)
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
                        const result = {
                            "@iot.id": tempResult.id,
                            "@iot.selfLink": `${this.ctx._odata.options.rootBase}Observations(${tempResult.id})`,
                            "phenomenonTime": `"${tempResult.phenomenonTime}"`,
                            "resultTime": `"${tempResult.resultTime}"`,
                            "result": res["rows"][0].result[0]["result"]["value"]
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
                // .catch((error: any) => {
                //     console.log(error);
                    
                //     if(error.code === "23505") this.ctx.throw(409, { code: 409, detail: errors.observationExist, link: `` });
                //     return undefined;
                // });
        } else if (datastream) { 
           Logs.debug("datastream", datastream);
           const getFeatureOfInterest = getBigIntFromString(dataInput["FeatureOfInterest"]);
           const searchFOI = await Common.dbContext.raw(
               getFeatureOfInterest
                   ? `SELECT coalesce((SELECT "id" FROM "featureofinterest" WHERE "id" = ${getFeatureOfInterest}), ${getFeatureOfInterest}) AS id `
                   : `SELECT id FROM ${this.DBST.FeaturesOfInterest.table} WHERE id =${datastream._default_foi}`
           );
   
           if (searchFOI["rows"].length < 1) {
               if (silent) 
                    return this.createReturnResult({ body: errors.noFoi });
                    else this.ctx.throw(400, { code: 400, detail: errors.noFoi });
           }

           const value = this.stean["decodedPayload"]["datas"] 
                ? this.stean["decodedPayload"]["datas"] 
                : this.stean["data"]["Data"] 
                    ? this.stean["data"]["Data"] 
                    : undefined;

            if (!value) {
                if (silent) 
                    return this.createReturnResult({ body: errors.noValue });
                    else this.ctx.throw(400, { code: 400, detail: errors.noValue });
            }

            const resultCreate = `'${JSON.stringify({"value": value})}'::jsonb`;            
           const insertObject = {
               "featureofinterest_id": "(select datastream1._default_foi from datastream1)",
               "datastream_id": "(select datastream1.id from datastream1)",
               "phenomenonTime": `to_timestamp('${this.stean["timestamp"]}','${EdatesType.dateWithOutTimeZone}')::timestamp`,
               "resultTime": `to_timestamp('${this.stean["timestamp"]}}','${EdatesType.dateWithOutTimeZone}')::timestamp`,
               "result": resultCreate
           };
           
           const searchDuplicate = Object.keys(insertObject) .slice(0, -1) .map((elem: string) => `"${elem}" = ${insertObject[elem]} AND `).concat(`"result" = ${resultCreate}`).join("");
           
           Logs.debug("searchDuplicate", searchDuplicate);
   
           const sql = `WITH "${VOIDTABLE}" AS (select srid FROM "${VOIDTABLE}" LIMIT 1)
               , datastream1 AS (SELECT id, _default_foi, thing_id FROM "${this.DBST.Datastreams.table}" WHERE id =${datastream.id})
               , myValues ( "${Object.keys(insertObject).join(QUOTEDCOMA)}") AS (values (${Object.values(insertObject).join()}))
               , searchDuplicate AS (SELECT * FROM "${this.DBST.Observations.table}" WHERE ${searchDuplicate})
               , observation1 AS (INSERT INTO  "${this.DBST.Observations.table}" ("${Object.keys(insertObject).join(QUOTEDCOMA)}") SELECT * FROM myValues
                                WHERE NOT EXISTS (SELECT * FROM searchDuplicate)
                               AND (select id from datastream1) IS NOT NULL
                               RETURNING *)
               , result1 AS (SELECT 
                    (SELECT observation1.id FROM observation1),
                    (SELECT searchDuplicate.id AS duplicate FROM searchDuplicate),
                    ${this.createListQuery(
                        Object.keys(insertObject),
                        "(SELECT observation1.COLUMN from observation1), "
                    )} (SELECT datastream1.id from datastream1) AS datastream, (select datastream1.thing_id from datastream1) AS thing)
                SELECT coalesce(json_agg(t), '[]') AS result FROM result1 AS t`;
   
   
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
                           result: tempResult["result"]["value"]
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
