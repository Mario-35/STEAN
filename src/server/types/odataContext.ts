/**
 * context interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EcolType } from "../enums";


export interface IodataContext {
    key: string | undefined;
    entity: string | undefined;
    target: string | undefined;
    identifier: string | undefined;
    identifierType: EcolType | undefined;
    relation: string | undefined;
    literal: string | undefined;
    sign: string | undefined;
    sql: string | undefined;    
    in: boolean | undefined;
}
