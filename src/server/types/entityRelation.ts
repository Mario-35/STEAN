/**
 * entityRelation interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EnumRelations } from "../enums";

export interface IentityRelation {
    type: EnumRelations; // relation Type
    expand: string; // table name
    link: string; // link query
    entityName: string; // table name
    tableName: string; // table reference
    relationKey: string; // column name
    entityColumn: string; // column name
    tableKey: string; // index key column name
}