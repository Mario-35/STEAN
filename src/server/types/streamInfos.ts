import { _STREAM } from "../db/constants";
import { EnumObservationType } from "../enums";

/**
 * streamInfos interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
export interface IstreamInfos {
    type: _STREAM, 
    id: BigInt , 
    observationType: EnumObservationType, 
    FoId: BigInt
}
