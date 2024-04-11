/**
 * entityRelation interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Erelations } from "../enums";


export interface expand {
    table: string; // relation Type
    column: string; // table name
    from: string; // link query
    field: string; // table name
    whereTable: string; // table reference
    whereKey: string; // table reference
    searchTable: string; // column name
    searchKey: string;
}

export interface IentityRelation {
    type: Erelations; // relation Type
    expand: string; // table name
    expand2?: expand; // table name
    link: string; // link query
    entityName: string; // table name
    tableName: string; // table reference
    relationKey: string; // column name
    entityColumn: string; // column name
    tableKey: string; // index key column name
}