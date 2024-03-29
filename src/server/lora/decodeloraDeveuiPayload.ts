/**
 * decodeloraDeveuiPayload for odata.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { decodingPayload } from ".";
import { executeSql } from "../db/helpers";
import { formatLog } from "../logger";
import { errors } from "../messages";
import { ILoraDecoder } from "../types";

export const decodeloraDeveuiPayload = async ( ctx: koa.Context, loraDeveui: string, payload: string ): Promise<ILoraDecoder| undefined> => {
  console.log(formatLog.debug(`decodeLoraPayload deveui : [${loraDeveui}]`, payload));  
  return await executeSql(ctx.config, `SELECT "name", "code", "nomenclature", "synonym" FROM "${ctx.model.Decoders.table}" WHERE id = (SELECT "decoder_id" FROM "${ctx.model.Loras.table}" WHERE "deveui" = '${loraDeveui}') LIMIT 1`)
    .then((res: object) => {
      try {
        return decodingPayload( { ...res[0] }, payload );        
      } catch (error) {
        return undefined
      }
    }).catch(() => {
      return {
        decoder: "undefined",
        result: undefined,
        error: errors.DecodingPayloadError};
      });
};
