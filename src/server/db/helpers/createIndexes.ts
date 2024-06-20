import { serverConfig } from "../../configuration";
import { _OK } from "../../constants";
import { EExtensions } from "../../enums";
import { asyncForEach } from "../../helpers";
import { log } from "../../log";
import { formatLog } from "../../logger";



const exe = async (name: string, queries: string[]): Promise<boolean> => {
    await asyncForEach( queries, async (query: string) => {
      await serverConfig
        .connection(name)
        .unsafe(query)
        .catch((error: Error) => {
          log.error(formatLog.error(error));
          return false;
        });
    });
    log.create(`Indexes : [${name}]`, _OK);
    return true;
}

export const createIndexes = (name: string): void => {
    const sqls = [`WITH datastreams AS (
        select distinct "datastream_id" AS id from observation
        ),
        datas AS (
            SELECT 
                "datastream_id" AS id,
                min("phenomenonTime") AS pmin ,
                max("phenomenonTime") AS pmax,
                min("resultTime") AS rmin,
                max("resultTime") AS rmax
            FROM observation, datastreams where  "datastream_id" = datastreams.id group by "datastream_id"
        )
        UPDATE "datastream" SET 
            "_phenomenonTimeStart" =  datas.pmin ,
            "_phenomenonTimeEnd" = datas.pmax,
            "_resultTimeStart" = datas.rmin,
            "_resultTimeEnd" = datas.rmax
        FROM datas where "datastream".id = datas.id`
    ] 
    if (serverConfig.getConfig(name).extensions.includes(EExtensions.multiDatastream)) {
        sqls.push(`WITH multidatastreams AS (
                select distinct "multidatastream_id" AS id from observation
            ),
            datas AS (
                SELECT 
                    "multidatastream_id" AS id,
                    min("phenomenonTime") AS pmin ,
                    max("phenomenonTime") AS pmax,
                    min("resultTime") AS rmin,
                    max("resultTime") AS rmax
                FROM observation, multidatastreams where "multidatastream_id" = multidatastreams.id group by "multidatastream_id"
            )
            UPDATE "multidatastream" SET 
                "_phenomenonTimeStart" =  datas.pmin ,
                "_phenomenonTimeEnd" = datas.pmax,
                "_resultTimeStart" = datas.rmin,
                "_resultTimeEnd" = datas.rmax
            FROM datas where "multidatastream".id = datas.id`);
    }
    exe(name, sqls);
  }
