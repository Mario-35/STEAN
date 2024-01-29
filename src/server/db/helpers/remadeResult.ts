import koa from "koa";
import { executeSqlValues } from ".";
import { serverConfig } from "../../configuration";
import { log } from "../../log";
import { asyncForEach, isNull } from "../../helpers";
import { decodeloraDeveuiPayload } from "../../lora";
import { IconfigFile } from "../../types";

const getSortedKeys = async ( config: IconfigFile, inputID: string, synonym: object ): Promise<{ [key: string]: number | null }> => {
  const tempSql = `SELECT id, _default_foi, thing_id, (SELECT jsonb_agg(tmp.units -> 'name') AS keys FROM ( SELECT jsonb_array_elements("unitOfMeasurements") AS units ) AS tmp) FROM "multidatastream" WHERE "multidatastream".id = ${inputID}`;
  const tempQuery = await executeSqlValues(config, tempSql);
  const multiDatastream = tempQuery["rows"];
  const listOfSortedValues: { [key: string]: number | null } = {};

  multiDatastream.keys.forEach((element: string, formatedDatas: object) => {
    listOfSortedValues[element] = null;
    const searchStr = element
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (formatedDatas[searchStr])
      listOfSortedValues[element] = formatedDatas[searchStr];
    else
      Object.keys(formatedDatas).forEach((subElem: string) => {
        if (element.toUpperCase().includes(subElem.toUpperCase()))
          listOfSortedValues[element] = formatedDatas[subElem];
        else if (synonym[element])
          synonym[element].forEach((key: string) => {
            if (key.toUpperCase().includes(subElem.toUpperCase()))
              listOfSortedValues[element] = formatedDatas[subElem];
          });
      });
  });

  return listOfSortedValues;
};

export const remadeResult = async ( ctx: koa.Context, step: number ): Promise<string> => {
  let progression = 1;
  const getObservations = await serverConfig
    .getConnection(ctx._config.name)`select * from observation WHERE result->'value' is null or result->'value' = '[null, null, null]' order by id ${
        step > 0 ? `LIMIT ${step}` : ""
      }`;
  await asyncForEach(getObservations["rows"], async (elem: object) => {
    const progressionStep = getObservations["rows"].length / 10;
    try {
      progression += 1;
      if (progression >= progressionStep) {
        process.stdout.write(".");
        progression = 1;
      } else progression += 1;
      let newResult: object | undefined = undefined;
      if (!isNull(elem["result"]["datas"])) {
        newResult = elem["result"];
        if (newResult) newResult["valueskeys"] = null;
        return newResult;
      } else if (!isNull(elem["multidatastream_id"])) {
        if (isNull(elem["result"])) {
          const sortedKeys = await getSortedKeys(
            ctx._config,
            elem["multidatastream_id"],
            {}
          );
          Object.keys(sortedKeys).forEach((key, index) => {
            sortedKeys[key] = elem["_resultnumbers"][index]
              ? elem["_resultnumbers"][index]
              : null;
          });
          newResult = {
            date: elem["phenomenonTime"],
            valueskeys: sortedKeys,
            value: Object.values(sortedKeys),
          };
        } else {
          const deveui: string | undefined = elem["result"]["devui"]
            ? elem["result"]["devui"]
            : elem["result"]["DevEUI"]
            ? elem["result"]["DevEUI"]
            : undefined;
          const payload: string | undefined = elem["result"]["payload"]
            ? elem["result"]["payload"]
            : undefined;

          if (deveui && payload) {
            const decodedPayload = await decodeloraDeveuiPayload(
              ctx,
              deveui.toUpperCase(),
              payload.toUpperCase()
            );
            if (decodedPayload) {
              console.log(decodedPayload);
  
              if (decodedPayload.error) {
                console.log(decodedPayload);
              } else if (decodedPayload.result.valid === false) {
                console.log( "================ Invalid =====================================" );
                console.log(elem);
                console.log(decodedPayload);
              } else if (decodedPayload.result.messages.length > 0) {
                const sortedKeys = await getSortedKeys( ctx._config, elem["multidatastream_id"], {} );
                const cleanDatas = {};
                console.log(sortedKeys);
                Object.keys(decodedPayload.result.datas).forEach((key) => {
                  cleanDatas[key.toLowerCase()] = decodedPayload.result.datas[key];
                });
                Object.keys(sortedKeys).forEach((key) => {
                  sortedKeys[key] = cleanDatas[key] ? cleanDatas[key] : null;
                });
                newResult = {
                  date: elem["result"]["date"],
                  valueskeys: sortedKeys,
                  value: Object.values(sortedKeys),
                  DevEUI: deveui.toUpperCase(),
                  payload: payload,
                };
            }
            }
          } else {
            console.log( "================ NO deveui and/or payload =====================================" );
            console.log(elem);
            console.log(`deveui: ${deveui} | payload:${payload}`);
          }
        }
      } else if (!isNull(elem["datastream_id"])) newResult = { date: elem["phenomenonTime"], value: elem["_resultnumber"], };
      
      console.log(newResult);

      if (newResult && newResult["rln"]) {
        await serverConfig .getConnection(ctx._config.name)`UPDATE "observation" SET "result" = '${JSON.stringify(newResult)}' WHERE id = ${ elem["id"] }`;
      }
    } catch (error) {
      log.errorMsg(error);
    }
  });
  const decodedPayload = await serverConfig.getConnection(ctx._config.name)`select 
    (SELECT count(*) from observation WHERE result->'value' is null) as "a traiter",
    (SELECT count(*) from observation WHERE result->'value' is null and result is not null) as "avec infos",
    (SELECT count(*) from observation WHERE result->'value' is null and result is null) as "sans infos",
    (SELECT count(*) from observation WHERE result->'value' = '[null, null, null]') as "Tous null"`;
  return decodedPayload["rows"];
};
