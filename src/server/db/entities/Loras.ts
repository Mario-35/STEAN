/**
 * Loras entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Common } from "./common";
import { getBigIntFromString, notNull, } from "../../helpers/index";
import { DOUBLEQUOTEDCOMA, ESCAPE_SIMPLE_QUOTE, VOIDTABLE } from "../../constants";
import { formatLog } from "../../logger";
import { IreturnResult } from "../../types";
import { errors, msg } from "../../messages/";
import { EdatesType } from "../../enums";
import { queryMultiDatastreamFromDeveui, queryStreamFromDeveui } from "../queries";
import { decodeloraDeveuiPayload } from "../../lora";
import { executeSql, executeSqlValues } from "../helpers";

export class Loras extends Common {
  synonym: object = {};
  stean: object = {};
  constructor(ctx: koa.Context) {
    super(ctx);
  }
  // prepare datas to lora input
  async prepareInputResult(dataInput: object): Promise<object> {
    console.log(formatLog.whereIam());
    const result = {};
    const listKeys = ["deveui", "DevEUI", "sensor_id", "frame"];
    if (notNull(dataInput["payload_deciphered"])) this.stean["frame"] = dataInput["payload_deciphered"].toUpperCase();
    Object.entries(dataInput).forEach( ([k, v]) => (result[listKeys.includes(k) ? k.toLowerCase() : k] = listKeys.includes( k ) ? v.toUpperCase() : v) );
    if (!isNaN(dataInput["timestamp"])) result["timestamp"] = new Date( dataInput["timestamp"] * 1000 ).toISOString();
    return result;
  }

  createListQuery(input: string[], columnListString: string): string {
    console.log(formatLog.whereIam());
    const tempList = columnListString.split("COLUMN");
    return tempList[0].concat( '"', input.join(`"${tempList[1]}${tempList[0]}"`), '"', tempList[1] );
  }

  async post( dataInput: object, silent?: boolean ): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    const addToStean = (key: string) => (this.stean[key] = dataInput[key]);
    if (dataInput) this.stean = await this.prepareInputResult(dataInput);
    function gedataInputtDate(): string | undefined {
      if (dataInput["datetime"]) return String(dataInput["datetime"]);
      const tempDate = new Date(dataInput["timestamp"] * 1000);
      if (dataInput["timestamp"]) return String(tempDate);
    }

    // search for MultiDatastream
    if (notNull(dataInput["MultiDatastream"])) {
      if (!notNull(this.stean["deveui"])) {
        if (silent) return this.createReturnResult({ body: errors.deveuiMessage });
        else this.ctx.throw(400, { code: 400, detail: errors.deveuiMessage });
      }
      addToStean("MultiDatastream");
      return await super.post(this.stean);
    }

    // search for Datastream
    if (notNull(dataInput["Datastream"])) {
      if (!notNull(dataInput["deveui"])) {
        if (silent) return this.createReturnResult({ body: errors.deveuiMessage });
        else this.ctx.throw(400, { code: 400, detail: errors.deveuiMessage });
      }
      addToStean("Datastream");
      return await super.post(this.stean);
    }

    // search for deveui
    if (!notNull(this.stean["deveui"])) {
      if (silent) return this.createReturnResult({ body: errors.deveuiMessage });
      else this.ctx.throw(400, { code: 400, detail: errors.deveuiMessage });
    }

    const stream = await executeSql(this.ctx._config, queryStreamFromDeveui(this.stean["deveui"])).then((res: object) => {
      if (res[0]["multidatastream"] != null) return res[0]["multidatastream"][0];
      if (res[0]["datastream"] != null) return res[0]["datastream"][0];
      this.ctx.throw(400, { code: 400, detail: errors.deveuiMessage });      
    });
    console.log(formatLog.debug("stream", stream));

    // search for frame and decode payload if found
    if (notNull(this.stean["frame"])) { 
      const temp = await decodeloraDeveuiPayload( this.ctx, this.stean["deveui"], this.stean["frame"] );
      if (!temp) return this.ctx.throw(400, { code: 400, detail: "dons ton cul lulu"});
      if (temp && temp.error) {
        if (silent) return this.createReturnResult({ body: temp.error });
        else this.ctx.throw(400, { code: 400, detail: temp.error });
      }      
      this.stean["decodedPayload"] = temp["result"];
      if (this.stean["decodedPayload"].valid === false) this.ctx.throw(400, { code: 400, detail: errors.InvalidPayload });
    }

    const searchMulti = queryMultiDatastreamFromDeveui(this.stean["deveui"]);
    this.stean["formatedDatas"] = {};
    
    if (stream["multidatastream"]) {
      if ( this.stean["decodedPayload"] && notNull(this.stean["decodedPayload"]["datas"]) )
        Object.keys(this.stean["decodedPayload"]["datas"]).forEach((key) => {
          this.stean["formatedDatas"][key.toLowerCase()] =
            this.stean["decodedPayload"]["datas"][key];
        });
  
      // convert all keys in lowercase
      if (notNull(dataInput["data"]))
        Object.keys(dataInput["data"]).forEach((key) => {
          this.stean["formatedDatas"][key.toLowerCase()] = dataInput["data"][key];
        });
  
      if (!notNull(this.stean["formatedDatas"])) {
        if (silent) return this.createReturnResult({ body: errors.dataMessage });
        else this.ctx.throw(400, { code: 400, detail: errors.dataMessage });
      }
    } else {
      if (this.stean["decodedPayload"] && this.stean["decodedPayload"]["datas"]) {
        this.stean["formatedDatas"] = this.stean["decodedPayload"]["datas"];
      } else {
          if (silent) return this.createReturnResult({ body: errors.dataMessage });
          else this.ctx.throw(400, { code: 400, detail: errors.dataMessage });
        }
    }

    console.log(formatLog.debug("Formated datas", this.stean["formatedDatas"]));

    this.stean["date"] = gedataInputtDate();
    if (!this.stean["date"]) {
      if (silent) return this.createReturnResult({ body: errors.noValidDate });
      else this.ctx.throw(400, { code: 400, detail: errors.noValidDate });
    }    
    
    if (stream["multidatastream"]) {
      console.log(formatLog.debug("multiDatastream", stream));
      const listOfSortedValues: { [key: string]: number | null } = {};
      stream["keys"].forEach((element: string) => {
        listOfSortedValues[element] = null;
        const searchStr = element .toLowerCase() .normalize("NFD") .replace(/[\u0300-\u036f]/g, "");
        if (this.stean["formatedDatas"][searchStr]) listOfSortedValues[element] = this.stean["formatedDatas"][searchStr];
        else
          Object.keys(this.stean["formatedDatas"]).forEach(
            (subElem: string) => {
              if (element.toUpperCase().includes(subElem.toUpperCase())) listOfSortedValues[element] = this.stean["formatedDatas"][subElem];
              else if (this.synonym[element])
                this.synonym[element].forEach((key: string) => {
                  if (key.toUpperCase().includes(subElem.toUpperCase())) listOfSortedValues[element] = this.stean["formatedDatas"][subElem];
                });
            }
          );
      });
      
      console.log(formatLog.debug("Values", listOfSortedValues));

      if ( Object.values(listOfSortedValues).filter((word) => word != null) .length < 1 ) {
        const errorMessage = `${errors.dataNotCorresponding} [${stream["keys"]}] with [${Object.keys(this.stean["formatedDatas"])}]`;
        if (silent) return this.createReturnResult({ body: errorMessage });
        else this.ctx.throw(400, { code: 400, detail: errorMessage });
      }

      const getFeatureOfInterest = getBigIntFromString( dataInput["FeatureOfInterest"] );

      const temp = listOfSortedValues;
      if (temp && typeof temp == "object") {
        const tempLength = Object.keys(temp).length;
        console.log(formatLog.debug( "data : Keys", `${tempLength} : ${stream["keys"].length}` ));

        if (tempLength != stream["keys"].length) {
          const errorMessage = msg(
            errors.sizeListKeys,
            String(tempLength),
            stream["keys"].length
          );
          if (silent) return this.createReturnResult({ body: errorMessage });
          else this.ctx.throw(400, { code: 400, detail: errorMessage });
        }
      }

      const resultCreate = `'${JSON.stringify({
        value: Object.values(listOfSortedValues),
        valueskeys: ESCAPE_SIMPLE_QUOTE(JSON.stringify(listOfSortedValues)),
        payload: this.stean["frame"],
      })}'::jsonb`;
      const insertObject = {
        featureofinterest_id: getFeatureOfInterest
          ? `select coalesce((SELECT "id" from "featureofinterest" WHERE "id" = ${getFeatureOfInterest}), ${getFeatureOfInterest})`
          : `(SELECT multidatastream1._default_foi from multidatastream1)`,
        multidatastream_id: "(SELECT multidatastream1.id from multidatastream1)",
        phenomenonTime: `to_timestamp('${this.stean["timestamp"]}','${EdatesType.dateWithOutTimeZone}')::timestamp`,
        resultTime: `to_timestamp('${this.stean["timestamp"]}','${EdatesType.dateWithOutTimeZone}')::timestamp`,
        result: resultCreate,
      };

      const searchDuplicate = Object.keys(insertObject)
        .slice(0, -1)
        .map((elem: string) => `"${elem}" = ${insertObject[elem]} AND `)
        .concat(`"result" = ${resultCreate}`)
        .join("");

      const sql = `WITH "${VOIDTABLE}" AS (SELECT srid FROM "${VOIDTABLE}" LIMIT 1)
                , multidatastream1 AS (SELECT id, thing_id, _default_foi, ${searchMulti} LIMIT 1)
                , myValues ( "${Object.keys(insertObject).join(
                  DOUBLEQUOTEDCOMA
                )}") AS (values (${Object.values(insertObject).join()}))
                , searchDuplicate AS (SELECT * FROM "${
                  this.ctx._model.Observations.table
                }" WHERE ${searchDuplicate})
                , observation1 AS (INSERT INTO  "${
                  this.ctx._model.Observations.table
                }" ("${Object.keys(insertObject).join(
                  DOUBLEQUOTEDCOMA
      )}") SELECT * FROM myValues WHERE NOT EXISTS (SELECT * FROM searchDuplicate)
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
      return await executeSqlValues(this.ctx._config, sql).then(async (res: object) => {
        // TODO MULTI 
        const tempResult = res[0][0];
        if (tempResult.id != null) {          
          const result = {
            "@iot.id": tempResult.id,
            "@iot.selfLink": `${this.ctx._odata.options.rootBase}Observations(${tempResult.id})`,
            phenomenonTime: `"${tempResult.phenomenonTime}"`,
            resultTime: `"${tempResult.resultTime}"`,
            result: tempResult["result"]["value"],
          };

          Object.keys(this.ctx._model["Observations"].relations).forEach((word) => {
            result[ `${word}@iot.navigationLink` ] = `${this.ctx._odata.options.rootBase}Observations(${tempResult.id})/${word}`;
          });

          return this.createReturnResult({ body: result, query: sql, });
        } else {
          if (silent) return this.createReturnResult({ body: errors.observationExist });
          else
            this.ctx.throw(409, {
              code: 409,
              detail: errors.observationExist,
              link: `${this.ctx._odata.options.rootBase}Observations(${[
                tempResult.duplicate,
              ]})`,
            });
        }
      });
    } else if (stream["datastream"]) {
      console.log(formatLog.debug("datastream", stream["datastream"]));
      const getFeatureOfInterest = getBigIntFromString(
        dataInput["FeatureOfInterest"]
      );
      const searchFOI = await executeSql(this.ctx._config, 
        getFeatureOfInterest
          ? `SELECT coalesce((SELECT "id" FROM "${this.ctx._model.FeaturesOfInterest.table}" WHERE "id" = ${getFeatureOfInterest}), ${getFeatureOfInterest}) AS id `
          : stream["_default_foi"] ? `SELECT id FROM "${this.ctx._model.FeaturesOfInterest.table}" WHERE id = ${stream["_default_foi"]}` : ""
      );
      
      if (searchFOI[0].length < 1) {
        if (silent) return this.createReturnResult({ body: errors.noFoi });
        else this.ctx.throw(400, { code: 400, detail: errors.noFoi });
      }

      const value = this.stean["decodedPayload"]["datas"]
        ? this.stean["decodedPayload"]["datas"]
        : this.stean["data"]["Data"]
        ? this.stean["data"]["Data"]
        : undefined;

      if (!value) {
        if (silent) return this.createReturnResult({ body: errors.noValue });
        else this.ctx.throw(400, { code: 400, detail: errors.noValue });
      }

      const resultCreate = `'${JSON.stringify({ value: value })}'::jsonb`;
      const insertObject = {
        featureofinterest_id: "(SELECT datastream1._default_foi from datastream1)",
        datastream_id: "(SELECT datastream1.id from datastream1)",
        phenomenonTime: `to_timestamp('${this.stean["timestamp"]}','${EdatesType.dateWithOutTimeZone}')::timestamp`,
        resultTime: `to_timestamp('${this.stean["timestamp"]}}','${EdatesType.dateWithOutTimeZone}')::timestamp`,
        result: resultCreate,
      };

      const searchDuplicate = Object.keys(insertObject)
        .slice(0, -1)
        .map((elem: string) => `"${elem}" = ${insertObject[elem]} AND `)
        .concat(`"result" = ${resultCreate}`)
        .join("");

      console.log(formatLog.debug("searchDuplicate", searchDuplicate));

      const sql = `WITH "${VOIDTABLE}" AS (SELECT srid FROM "${VOIDTABLE}" LIMIT 1)
               , datastream1 AS (SELECT id, _default_foi, thing_id FROM "${
                 this.ctx._model.Datastreams.table
               }" WHERE id =${stream["id"]})
               , myValues ( "${Object.keys(insertObject).join(
                DOUBLEQUOTEDCOMA
               )}") AS (values (${Object.values(insertObject).join()}))
               , searchDuplicate AS (SELECT * FROM "${
                 this.ctx._model.Observations.table
               }" WHERE ${searchDuplicate})
               , observation1 AS (INSERT INTO  "${
                 this.ctx._model.Observations.table
               }" ("${Object.keys(insertObject).join(
                DOUBLEQUOTEDCOMA
      )}") SELECT * FROM myValues
                                WHERE NOT EXISTS (SELECT * FROM searchDuplicate)
                               AND (SELECT id from datastream1) IS NOT NULL
                               RETURNING *)
               , result1 AS (SELECT 
                    (SELECT observation1.id FROM observation1),
                    (SELECT searchDuplicate.id AS duplicate FROM searchDuplicate),
                    ${this.createListQuery(
                      Object.keys(insertObject),
                      "(SELECT observation1.COLUMN from observation1), "
                    )} (SELECT datastream1.id from datastream1) AS datastream, (SELECT datastream1.thing_id from datastream1) AS thing)
                SELECT coalesce(json_agg(t), '[]') AS result FROM result1 AS t`;

      return await executeSql(this.ctx._config, sql).then(async (res: object) => {
        const tempResult = res[0].result[0];
        if (tempResult.id != null) {
          const result = {
            "@iot.id": tempResult.id,
            "@iot.selfLink": `${this.ctx._odata.options.rootBase}Observations(${tempResult.id})`,
            phenomenonTime: `"${tempResult.phenomenonTime}"`,
            resultTime: `"${tempResult.resultTime}"`,
            result: tempResult["result"]["value"],
          };

          Object.keys(this.ctx._model["Observations"].relations).forEach((word) => {
            result[ `${word}@iot.navigationLink` ] = `${this.ctx._odata.options.rootBase}Observations(${tempResult.id})/${word}`;
          });

          return this.createReturnResult({
            body: result,
            query: sql,
          });
        } else {
          if (silent) return this.createReturnResult({ body: errors.observationExist });
          else
            this.ctx.throw(409, {
              code: 409,
              detail: errors.observationExist,
              link: `${this.ctx._odata.options.rootBase}Observations(${[
                tempResult.duplicate,
              ]})`,
            });
        }
      });
    }
  }
}
