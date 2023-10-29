/**
 * decodeloraDeveuiPayload for odata.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";
import { decodingPayload } from ".";
import { _DB } from "../db/constants";
import { Logs } from "../logger";
import { errors } from "../messages";
import { ILoraDecoder } from "../types";

export const decodeloraDeveuiPayload = async (
  knexInstance: Knex | Knex.Transaction,
  loraDeveui: string,
  input: string
): Promise<ILoraDecoder> => {
  Logs.debug(`decodeLoraPayload deveui : [${loraDeveui}]`, input);
  return await knexInstance(_DB.Decoders.table)
    .select("name", "code", "nomenclature", "synonym")
    .whereRaw(
      `id = (SELECT "decoder_id" FROM "${_DB.Loras.table}" WHERE "deveui" = '${loraDeveui}')`
    )
    .first()
    .then((res: object) => {
      if (res) {
        return decodingPayload(
          {
            name: res["name"],
            code: String(res["code"]),
            nomenclature: res["nomenclature"],
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
