/**
 * Ifield interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EcolType } from "../enums";


export interface Ifield {
    name: string | undefined;
    type: EcolType;
    alias: string | undefined;
    raw?: boolean;
}
