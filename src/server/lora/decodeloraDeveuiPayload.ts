/**
 * decodeloraDeveuiPayload for odata.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { decodingPayload } from ".";
import { _DB } from "../db/constants";
import { executeSql } from "../db/helpers";
import { Logs } from "../logger";
import { errors } from "../messages";
import { ILoraDecoder } from "../types";

export const decodeloraDeveuiPayload = async (
  configName: string,
  loraDeveui: string,
  input: string
): Promise<ILoraDecoder> => {
  Logs.debug(`decodeLoraPayload deveui : [${loraDeveui}]`, input);
  return await executeSql(configName, `SELECT "name", "code", "nomenclature", "synonym" FROM "${_DB.Decoders.table}" WHERE id = (SELECT "decoder_id" FROM "${_DB.Loras.table}" WHERE "deveui" = '${loraDeveui}') LIMIT 1`)
    .then((res: object) => {
      if (res["rows"]) {
        return decodingPayload(
          {
            name: res["rows"][0]["name"],
            code: String(res["rows"][0]["code"]),
            nomenclature: res["rows"][0]["nomenclature"],
          },
          input
        );
      }
      return {
        decoder: res["name"],
        result: undefined,
        error: errors.DecodingPayloadError,
      };
    });
};
