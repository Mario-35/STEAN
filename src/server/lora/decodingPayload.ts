/**
 * decodingPayload for odata.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Logs } from "../logger";
import { errors } from "../messages";
import { ILoraDecoder } from "../types";

export const decodingPayload = ( decoder: { name: string; code: string; nomenclature: string }, payload: string ): ILoraDecoder | undefined => {
  Logs.head("decodingPayload");
  if (decoder.name && decoder.nomenclature && decoder.code != 'undefined') {
    try {
      const F = new Function( "input", "nomenclature", `${String(decoder.code)}; return decode(input, nomenclature);` );
      const result = F( payload, decoder.nomenclature === "{}" || decoder.nomenclature === "" ? null : JSON.parse(decoder.nomenclature) );
      return { decoder: decoder.name, result: result };
    } catch (error) {
      Logs.error(error);
      return {
        decoder: decoder.name,
        result: undefined,
        error: errors.DecodingPayloadError,
      };
    }
  }
};
