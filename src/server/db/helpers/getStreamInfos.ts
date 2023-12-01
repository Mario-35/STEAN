/**
 * countId.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Logs } from "../../logger";
import { queryAsJson } from "../queries";
import { IstreamInfos } from "../../types";
import { _DB, _STREAM } from "../constants";
import { executeSqlValues, getEntityName } from ".";

export const getStreamInfos = async ( configName: string, input: JSON ): Promise<IstreamInfos | undefined> => {
  Logs.whereIam();
  const stream: _STREAM = input["Datastream"] ? "Datastream" : input["MultiDatastream"] ? "MultiDatastream" : undefined;
  if (!stream) return undefined;
  const streamEntity = getEntityName(stream); if (!streamEntity) return undefined;
  const foiId: bigint | undefined = input["FeaturesOfInterest"] ? input["FeaturesOfInterest"] : undefined;
  const searchKey = input[_DB[streamEntity].name] || input[_DB[streamEntity].singular];
  const streamId: string | undefined = isNaN(searchKey) ? searchKey["@iot.id"] : searchKey;
  if (streamId) {
    const query = `SELECT "id", "observationType", "_default_foi" FROM "${ _DB[streamEntity].table }" WHERE id = ${BigInt(streamId)} LIMIT 1`;
    return executeSqlValues(configName, queryAsJson({ query: query, singular: true, count: false }))
      .then((res: object) => {        
        return res ? {
          type: stream,
          id: res[0]["id"],
          observationType: res[0]["observationType"],
          FoId: foiId ? foiId : res[0]["_default_foi"],
        } : undefined;
      })
      .catch((error) => {
        Logs.error(error);
        return undefined;
      });
  }
};
