/**
 * countId.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";
import { getEntityName } from "../../helpers";
import { queryAsJson } from "../../helpers/returnFormats";
import { Logs } from "../../logger";
import { IstreamInfos } from "../../types";
import { _DBDATAS, _STREAM } from "../constants";

export const getStreamInfos = async (conn: Knex | Knex.Transaction, input: JSON): Promise<IstreamInfos | undefined> => {
    Logs.head("getStreamInfos");
    const stream: _STREAM = input["Datastream"] ? "Datastream" : input["MultiDatastream"] ? "MultiDatastream" : undefined;
    if(!stream) return undefined;
    const streamEntity = getEntityName(stream);
    if(!streamEntity) return undefined;
    const foiId: bigint | undefined = input["FeaturesOfInterest"] ? input["FeaturesOfInterest"] : undefined;       
    const searchKey = input[_DBDATAS[streamEntity].name] || input[_DBDATAS[streamEntity].singular];
    const streamId: string | undefined = isNaN(searchKey) ? searchKey["@iot.id"] : searchKey;
    if (streamId) {
        const query = `SELECT "id", "observationType", "_default_foi" FROM "${_DBDATAS[streamEntity].table}" WHERE id = ${BigInt(streamId)} LIMIT 1`;
        return await conn.raw(queryAsJson({query: query, singular: true, count: false}))
        .then((res: object) => {
            const temp = res["rows"][0].results;                    
            return {type: stream, id: temp["id"], observationType: temp["observationType"], FoId: foiId ? foiId : temp["_default_foi"]};
        })
        .catch((error) => {                
            Logs.error(error);
            return undefined;
        });
    }
};