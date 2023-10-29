/**
 * queryMultiDatastreamFromDeveui.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _DB } from "../constants";

export const queryMultiDatastreamFromDeveui = (
  input: string
): string => `(SELECT jsonb_agg(tmp.units -> 'name') AS keys 
FROM ( SELECT jsonb_array_elements("unitOfMeasurements") AS units ) AS tmp) 
    FROM "${_DB.MultiDatastreams.table}" 
    WHERE "${_DB.MultiDatastreams.table}".id = (
        SELECT "${_DB.Loras.table}"."multidatastream_id" 
        FROM "${_DB.Loras.table}" 
        WHERE "${_DB.Loras.table}"."deveui" = '${input}')`;
