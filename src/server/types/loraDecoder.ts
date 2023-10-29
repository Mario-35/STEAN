/**
 * LoraDecoder interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export interface ILoraDecoder {
    decoder: string;
    result?: any;
    error?: unknown;
  }