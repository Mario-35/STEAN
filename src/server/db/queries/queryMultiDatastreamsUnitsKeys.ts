/**
 * queryMultiDatastreamsUnitsKeys.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/

import { _DB } from "../constants";

export const queryMultiDatastreamsUnitsKeys = (searchId: bigint | string): string => `SELECT jsonb_agg(tmp.units -> 'name') AS keys FROM  ( SELECT jsonb_array_elements("unitOfMeasurements") AS units FROM "${_DB.MultiDatastreams.table}" WHERE id = ${searchId} ) AS tmp`;