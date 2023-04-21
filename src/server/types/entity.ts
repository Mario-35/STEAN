/**
 * Entity interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IentityColumn, IentityRelation } from ".";

export interface Ientity {
    readonly name: string; // Entity Name
    readonly lora: boolean; // Is extend of SensorThings standard
    readonly multiDatastream: boolean; // Is extend of SensorThings standard
    readonly clone?: string;
    readonly singular: string;
    readonly table: string;
    readonly order: number;
    readonly columns: IentityColumn;
    readonly admin: boolean;
    readonly relations: { [key: string]: IentityRelation };
    readonly constraints?: {[key: string]: string};
    readonly indexes?: {[key: string]: string};
    readonly after?: string;
}
