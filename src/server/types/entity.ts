/**
 * Entity interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */



interface IEntityColumn {
    [key: string]: {
        readonly create: string;
        readonly alias?: string;
        readonly unique?: boolean;
        readonly test?: string;
        readonly dataList?: { [key: string]: string };
        readonly type?: string;
        readonly verify?: {
            list: string[];
            default: string;
        }
    };
}

export enum RELATIONS {
    belongsTo,
    belongsToMany,
    hasMany
}

interface IEntityRelation {
    type: RELATIONS; // relation Type
    expand: string; // table name
    link: string; // link query
    entityName: string; // table name
    tableName: string; // table reference
    relationKey: string; // column name
    entityColumn: string; // column name
    tableKey: string; // index key column name
}

export interface IEntity {
    readonly name: string;
    readonly clone?: string;
    readonly singular: string;
    readonly table: string;
    readonly order: number;
    readonly columns: IEntityColumn;
    readonly admin: boolean;
    readonly relations: { [key: string]: IEntityRelation };
    readonly constraints?: {[key: string]: string};
    readonly indexes?: {[key: string]: string};
    readonly after?: string;
}
export interface IEntity {
    readonly name: string;
    readonly clone?: string;
    readonly singular: string;
    readonly table: string;
    readonly order: number;
    readonly columns: IEntityColumn;
    readonly admin: boolean;
    readonly relations: { [key: string]: IEntityRelation };
    readonly constraints?: {[key: string]: string};
    readonly indexes?: {[key: string]: string};
    readonly after?: string;
}
