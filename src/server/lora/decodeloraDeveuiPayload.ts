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

export const decodeloraDeveuiPayload = async ( configName: string, loraDeveui: string, input: string ): Promise<ILoraDecoder| undefined> => {
  Logs.debug(`decodeLoraPayload deveui : [${loraDeveui}]`, input);
  return await executeSql(configName, `SELECT "name", "code", "nomenclature", "synonym" FROM "${_DB.Decoders.table}" WHERE id = (SELECT "decoder_id" FROM "${_DB.Loras.table}" WHERE "deveui" = '${loraDeveui}') LIMIT 1`)
    .then((res: object) => {
        return decodingPayload(
          {
            name: res["name"],
            code: String(res["code"]),
            nomenclature: res["nomenclature"],
          },
          input
        );
    }).catch(() => {
      return {
        decoder: "undefined",
        result: undefined,
        error: errors.DecodingPayloadError};
      });
};
