/**
 * createPostSql.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { VOIDTABLE } from "../../../constants";
import { addDoubleQuotes, getBigIntFromString } from "../../../helpers";
import { formatLog } from "../../../logger";
import { Ientity, IKeyString } from "../../../types";
import { EoperationType } from "../../../enums/";
import { PgVisitor } from "../PgVisitor";
import { createPgQuery } from ".";
import { queryAsJson } from "../../../db/queries";
import { models } from "../../../models";
import { log } from "../../../log";
export function createPostSql(datas: object, configName: string, main: PgVisitor): string {
    let sqlResult = "";
    const queryMaker: {
        [key: string]: {
            type: EoperationType;
            table: string;
            datas: object;
            keyId: string;
        };
    } = {};
    const tempEntity = main.entity;
    const postEntity: Ientity = main.ctx._model[tempEntity == "CreateFile" ? "Datastreams" : tempEntity];
    const postParentEntity: Ientity | undefined = main.parentEntity ? main.ctx._model[main.parentEntity ] : undefined;
    const names: IKeyString = {
        [postEntity.table]: postEntity.table
    };
    let level = 0;
    
    const allFields = "*";

    const getRelationNameFromEntity = (source: Ientity, from: Ientity): string | undefined => {
        return Object.keys(source.relations).includes(from.name)
        ? from.name
        : Object.keys(source.relations).includes(from.singular)
        ? from.singular
        : undefined;
    };
    
    /**
     *
     * @param query query for the query not in as
     * @returns
     */
    const queryMakerToString = (query: string): string => {
        const returnValue: string[] = [query];
        const links: { [key: string]: string[] } = {};
        const sorting: string[] = [];
        Object.keys(queryMaker).forEach((element: string) => {
            Object.keys(queryMaker).forEach((elem: string) => {
                if (JSON.stringify(queryMaker[elem].datas).includes(`select ${element}`)) {
                    if (links[elem]) links[elem].push(element);
                    else links[elem] = [element];
                }
            });
        });
        //  pre sorting for some case like multidatastreams
        Object.keys(links).forEach((elem: string) => {
            Object.keys(links).forEach((subElem: string) => {
                if (links[elem].includes(subElem) && !sorting.includes(subElem)) sorting.push(subElem);
            });
        });
        // sorting
        Object.keys(queryMaker).forEach((elem: string) => {
            if (Object.keys(links).includes(elem)) {
                if (!sorting.includes(elem)) sorting.push(elem);
            } else {
                sorting.unshift(elem);
            }
        });
        // LOOP on sorting
        sorting.forEach((element: string) => {
            if (queryMaker[element].datas.hasOwnProperty("@iot.id")) {
                const searchId = queryMaker[element].datas["@iot.id"];
                returnValue.push( `, ${element} AS (select verifyId('${queryMaker[element].table}', ${searchId}) as id)` );
                // returnValue.push( `, ${element} AS (select "id" from "${queryMaker[element].table}" where "id" = ${searchId})` );
            } else if (queryMaker[element].datas.hasOwnProperty("@iot.name")) {
                const searchByName = queryMaker[element].datas["@iot.name"];
                returnValue.push( `, ${element} AS (select "id" from "${queryMaker[element].table}" where "name" = '${searchByName}')` );
            } else {
                returnValue.push(`, ${element} AS (`);
                if (main.id) {
                    if (queryMaker[element].type == EoperationType.Association) 
                        returnValue.push(`INSERT INTO "${queryMaker[element].table}" ${models.createInsertValues(main.ctx._config, queryMaker[element].datas)} on conflict ("${Object.keys(queryMaker[element].datas).join('","')}") do update set ${models.createUpdateValues(queryMaker[element].datas)} WHERE "${queryMaker[element].table}"."${queryMaker[element].keyId}" = ${BigInt(main.id).toString()}`);
                    else
                        returnValue.push(`UPDATE "${queryMaker[element].table}" set ${models.createUpdateValues(queryMaker[element].datas)} WHERE "${queryMaker[element].table}"."${queryMaker[element].keyId}" = (select verifyId('${queryMaker[element].table}', ${main.id}) as id)`);
                } else returnValue.push(`INSERT INTO "${queryMaker[element].table}" ${models.createInsertValues(main.ctx._config, queryMaker[element].datas)}`);                            
                    returnValue.push(`RETURNING ${postEntity.table == queryMaker[element].table ? allFields : queryMaker[element].keyId})`);
            }
        });
        // format object quotes
        return returnValue.join("\n").replace(/\'@/g, "").replace(/\@'/g, "");
    };
    
    /**
     *
     * @param datas datas
     * @param entity entity for the datas if not root entity
     * @param parentEntity parent entity for the datas if not root entity
     * @returns result
     */
    const start = (datas: object, entity?: Ientity, parentEntity?: Ientity): object | undefined => {
        console.log(formatLog.head(`start level ${level++}`));        
        const returnValue = {};
        entity = entity ? entity : postEntity;
        parentEntity = parentEntity ? parentEntity : postParentEntity ? postParentEntity : postEntity;
        
        for (const key in datas) {
            if (entity && !Object.keys(entity.relations).includes(key)) {
                returnValue[key] = typeof datas[key] === "object" ? JSON.stringify(datas[key]) : datas[key];
                delete datas[key];
            }
        }
        /**
         *
         * @param inputNameEntity {string} name of the entity
         * @returns name of th next entity {inputNameEntity1}
         */
        const createName = (inputNameEntity: string): string => {
            let number = 0;
            if (names[inputNameEntity]) {
                const numbers = names[inputNameEntity].match(/[0-9]/g);
                number = numbers !== null ? Number(numbers.join("")) : 0;
            }
            return `${inputNameEntity}${(number + 1).toString()}`;
        };
        
        /**
         *  add or make query entry
         * @param name name
         * @param tableName table nae for insert
         * @param datas datas to insert string if key is send or object
         * @param key key of the value
         */
        const addToQueryMaker = (
            type: EoperationType,
            name: string,
            tableName: string,
            datas: string | object,
            keyId: string,
            key: string | undefined
            ): void => {
                const isTypeString = typeof datas === "string";
                if (queryMaker.hasOwnProperty(name)) {
                    if (key && isTypeString) {
                        queryMaker[name].datas[key] = datas;
                        queryMaker[name].keyId = keyId;
                    } else if (!isTypeString) {
                        if (queryMaker[name].type == EoperationType.Table || queryMaker[name].type == EoperationType.Relation)
                        queryMaker[name].datas = Object.assign(queryMaker[name].datas, datas);
                        queryMaker[name].keyId = keyId;
                        
                        if (queryMaker[name].type == EoperationType.Association)
                        queryMaker[createName(name)] = {
                            type: queryMaker[name].type,
                            table: queryMaker[name].table,
                            datas: datas,
                            keyId: queryMaker[name].keyId
                        };
                    }
                } else {
                    if (key && isTypeString)
                    queryMaker[name] = {
                        type: type,
                        table: tableName,
                        datas: { [key]: datas },
                        keyId: keyId
                    };
                    else if (!isTypeString)
                    queryMaker[name] = {
                        type: type,
                        table: tableName,
                        datas: datas,
                        keyId: keyId
                    };
                }
            };
            
            /**
             *
             * @param subEntity {Ientity} entity to use
             * @param subParentEntity {Ientity} entity parent
             */
        const addAssociation = (subEntity: Ientity, subParentEntity: Ientity) => {
            console.log(formatLog.debug(`addAssociation in ${subEntity.name} for parent`, subParentEntity.name));

            const relationName = getRelationNameFromEntity(subEntity, subParentEntity);
            const parentRelationName = getRelationNameFromEntity(subParentEntity, subEntity);
            
            if (parentRelationName && relationName) {
                const relation = subEntity.relations[relationName];
                const parentRelation = subParentEntity.relations[parentRelationName];
                console.log(formatLog.debug(`Found a parent relation in ${subEntity.name}`, subParentEntity.name));
                
                if (relation.tableName == parentRelation.tableName && relation.tableName == subEntity.table) {
                    console.log(formatLog.debug("Found a relation to do in sub query", subParentEntity.name));
                    const tableName = names[subEntity.table];
                    const parentTableName = names[subParentEntity.table];
                    
                    addToQueryMaker(
                        EoperationType.Relation,
                        tableName,
                        subEntity.table,
                        `@(select ${parentTableName}.id from ${parentTableName})@`,
                        parentRelation.tableKey,
                        parentRelation.relationKey
                        );
                    } else if (relation.tableName == parentRelation.tableName) {
                        if (relation.tableName == subParentEntity.table) {
                            const tableName = names[subEntity.table];
                            const parentTableName = names[subParentEntity.table];
                            console.log(formatLog.debug(`Add parent relation ${tableName} in`, parentTableName));                            
                            addToQueryMaker(
                                EoperationType.Relation,
                                parentTableName,
                                subParentEntity.table,
                                `@(select ${tableName}.id from ${tableName})@`,
                                parentRelation.tableKey,
                                relation.relationKey
                                );
                            } else if (relation.tableName != subParentEntity.table && relation.tableName != subEntity.table) {
                                const tableName = names[subEntity.table];
                                const parentTableName = names[subParentEntity.table];
                                console.log(formatLog.debug(`Add Table association ${tableName} in`, parentTableName));
                                addToQueryMaker(
                                    EoperationType.Association,
                                    relation.tableName,
                                    relation.tableName,
                                    {
                                        [`${subEntity.table}_id`]: `@(select ${tableName}.id from ${tableName})@`,
                                        [`${subParentEntity.table}_id`]: `@(select ${parentTableName}.id from ${parentTableName})@`
                                    },
                                    relation.tableKey,
                                    undefined
                                    );
                                }
                } else {
                    const tableName = names[subEntity.table];
                    const parentTableName = names[subParentEntity.table];
                    console.log(formatLog.debug(`Add Relation ${tableName} in`, parentTableName));
                    addToQueryMaker(
                        EoperationType.Table,
                        parentTableName,
                        subParentEntity.table,
                        {
                            [relation.relationKey]: `@(select ${tableName}.id from ${tableName})@`
                        },
                        relation.tableKey,
                        undefined
                        );
                    }
            }
        };

        /**
         *
         * @param key key Name
         * @param value Datas to process
         */
        const subBlock = (key: string, value: object) => {
            const entityNameSearch = models.getEntityName(main.ctx._config, key);
            if (entityNameSearch) {
                const newEntity = main.ctx._model[entityNameSearch];
                const name = createName(newEntity.table);
                names[newEntity.table] = name;
                const test = start(value, newEntity, entity);
                if (test) {
                    addToQueryMaker(EoperationType.Table, name, newEntity.table, test, "id", undefined);
                    level--;
                }
                if (entity) addAssociation(newEntity, entity);
            }
        };

        // Main loop
        if (entity && parentEntity) {
            for (const key in datas) {
                if (Array.isArray(datas[key])) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    Object.entries(datas[key]).forEach(([_key, value]) => {
                        if (entity && parentEntity && Object.keys(entity.relations).includes(key)) {
                            console.log(formatLog.debug(`Found a relation for ${entity.name}`, key));
                            subBlock(key, value as object);
                        } else {
                            console.log(formatLog.debug(`data ${key}`, datas[key]));
                            returnValue[key] = datas[key];
                        }
                    });
                } else if (typeof datas[key] === "object") {
                    if (Object.keys(entity.relations).includes(key)) {
                        console.log(formatLog.debug(`Found a object relation for ${entity.name}`, key));
                        subBlock(key, datas[key]);
                    }
                } else returnValue[key] = datas[key];
            }
        }
        return returnValue;
    };


    if (main.parentEntity) {
        const entityName =models.getEntityName(main.ctx._config, main.parentEntity);
        console.log(formatLog.debug("Found entity : ", entityName));
        const callEntity = entityName ? main.ctx._model[entityName] : undefined;
        const id: bigint | undefined =
        typeof main.parentId== "string" ? getBigIntFromString(main.parentId) : main.parentId;
        if (entityName && callEntity && id && id > 0) {
            const relationName = getRelationNameFromEntity(postEntity, callEntity);
            if (relationName) datas[relationName] = { "@iot.id": id.toString() };
        }
    }
    const root = start(datas);
    
    if ((names[postEntity.table] && queryMaker[postEntity.table] && queryMaker[postEntity.table].datas) || root === undefined) {
        queryMaker[postEntity.table].datas = Object.assign(root as object, queryMaker[postEntity.table].datas);
        queryMaker[postEntity.table].keyId = main.id ? "id" : "*";
        sqlResult = queryMakerToString(`WITH "log_request" AS (SELECT srid FROM ${addDoubleQuotes(VOIDTABLE)} LIMIT 1)`);
    } else {
        sqlResult = queryMakerToString(
            main.id
            ? root && Object.entries(root).length > 0
            ? `WITH ${postEntity.table} AS (UPDATE ${addDoubleQuotes(postEntity.table)} set ${models.createUpdateValues(root)} WHERE "id" = (select verifyId('${postEntity.table}', ${main.id}) as id) RETURNING ${allFields})`
                : `WITH ${postEntity.table} AS (SELECT * FROM ${addDoubleQuotes(postEntity.table)} WHERE "id" = ${main.id.toString()})`
                : `WITH ${postEntity.table} AS (INSERT INTO ${addDoubleQuotes(postEntity.table)} ${models.createInsertValues(main.ctx._config, root)} RETURNING ${allFields})`
                );
            }
    const temp = createPgQuery(main, main); 
    sqlResult += queryAsJson({
        query: `SELECT ${temp && temp.select ? temp.select : "*"} FROM ${names[postEntity.table]} ${temp && temp.groupBy ? `GROUP BY ${temp.groupBy}` : ''}`, 
        singular: false, 
        count: false
    });
    log.query(`\n${sqlResult}`);
    return sqlResult;
}
