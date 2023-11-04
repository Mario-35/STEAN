/**
 * countId.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { getEntityName } from "../../helpers";
import { Logs } from "../../logger";
import { queryAsJson } from "../queries";
import { IstreamInfos } from "../../types";
import { _DB, _STREAM } from "../constants";
import { executeSql } from ".";

export const getStreamInfos = async (
  configName: string,
  input: JSON
): Promise<IstreamInfos | undefined> => {
  Logs.whereIam();
  const stream: _STREAM = input["Datastream"]
    ? "Datastream"
    : input["MultiDatastream"]
    ? "MultiDatastream"
    : undefined;
  if (!stream) return undefined;
  const streamEntity = getEntityName(stream);
  if (!streamEntity) return undefined;
  const foiId: bigint | undefined = input["FeaturesOfInterest"]
    ? input["FeaturesOfInterest"]
    : undefined;
  const searchKey =
    input[_DB[streamEntity].name] || input[_DB[streamEntity].singular];
  const streamId: string | undefined = isNaN(searchKey)
    ? searchKey["@iot.id"]
    : searchKey;
  if (streamId) {
    const query = `SELECT "id", "observationType", "_default_foi" FROM "${
      _DB[streamEntity].table
    }" WHERE id = ${BigInt(streamId)} LIMIT 1`;
    return executeSql(configName, queryAsJson({ query: query, singular: true, count: false }))
      .then((res: object) => {
        const temp = res["rows"][0].results;
        return {
          type: stream,
          id: temp["id"],
          observationType: temp["observationType"],
          FoId: foiId ? foiId : temp["_default_foi"],
        };
      })
      .catch((error) => {
        Logs.error(error);
        return undefined;
      });
  }
};
