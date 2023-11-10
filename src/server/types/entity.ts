/**
 * Entity interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IentityColumn, IentityRelation, IKeyString } from ".";
import { EextensionsType } from "../enums";

export interface Ientity {
    readonly name: string; // Entity Name
    readonly count: string; // Entity Name
    readonly clone?: string;
    readonly singular: string;
    readonly table: string;
    readonly order: number;
    readonly orderBy: string;
    readonly columns: IentityColumn;
    readonly canPost: boolean;
    readonly relations: { [key: string]: IentityRelation };
    readonly constraints?: IKeyString;
    readonly indexes?: IKeyString;
    readonly after?: string;
    readonly extensions: EextensionsType[];
}
