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
     name: string; // Entity Name
     count: string; // Entity Name
     clone?: string;
     singular: string;
     table: string;
     createOrder: number;
     order: number;
     orderBy: string;
     columns: IentityColumn;
     relations: { [key: string]: IentityRelation };
     constraints?: IKeyString;
     indexes?: IKeyString;
     after?: string;
     extensions: EextensionsType[];
}
