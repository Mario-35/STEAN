
/**
 * createTable.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";
import { message } from "../../logger";
import { IEntity } from "../../types";

export const createTable = async(connectionDb: Knex | Knex.Transaction, tableEntity: IEntity, doAfter: string | undefined): Promise<{ [key: string]: string }> => {
    if(!tableEntity) return {};

    let space = 5;
    const tab = () => " ".repeat(space);
    const tabInsertion: string[] = [];
    const tabConstraints: string[] = [];
    const  returnValue: { [key: string]: string } ={};

    let insertion = "";
    if (!connectionDb) {
        message(false, "ERROR", "connection Error");
        return { error: "connection Error" };
    }


    // create postgis
    returnValue[`${tab()}Create postgis`] = await connectionDb
        .raw("CREATE EXTENSION IF NOT EXISTS postgis;")
        .then(() => "✔")
        .catch((error: Error) => error.message);

    returnValue[`${tab()}Create tablefunc`] = await connectionDb
        .raw("CREATE EXTENSION IF NOT EXISTS tablefunc;")
        .then(() => "✔")
        .catch((error: Error) => error.message);

    Object.keys(tableEntity.columns).forEach((column) => {
        if (tableEntity.columns[column].create.trim() != "") tabInsertion.push(`"${column}" ${tableEntity.columns[column].create}`);
    });
    insertion = `${tabInsertion.join(", ")}`;

    if (tableEntity.constraints) {
        Object.keys(tableEntity.constraints).forEach((constraint) => {
            if (tableEntity.constraints)
                tabConstraints.push(`ALTER TABLE ONLY "${tableEntity.table}" ADD CONSTRAINT "${constraint}" ${tableEntity.constraints[constraint]};`);
        });
    }

    if (tableEntity.table.trim() != "") returnValue[String(`Create table ${tableEntity.table}`)] = await connectionDb
        .raw(`CREATE TABLE "${tableEntity.table}" (${insertion});`)
        .then(() => "✔")
        .catch((error: Error) => error.message);

    const indexes = tableEntity.indexes;
    const tabTemp: string[] = [];

    // CREATE INDEXES
    if (indexes)
        Object.keys(indexes).forEach((index) => {
            tabTemp.push(`CREATE INDEX "${index}" ${indexes[index]}`);
        });

    if (tabTemp.length > 0)
        returnValue[`${tab()}Create indexes for ${tableEntity.name}`] = await connectionDb
            .raw(tabTemp.join(";"))
            .then(() => "✔")
            .catch((error: Error) => error.message);

    // CREATE CONSTRAINTS
    if (tableEntity.constraints && tabConstraints.length > 0)
        returnValue[`${tab()}Create constraints for ${tableEntity.table}`] = await connectionDb
            .raw(tabConstraints.join(" "))
            .then(() => "✔")
            .catch((error: Error) => error.message);

    // CREATE SOMETHING AFTER
    if (tableEntity.after) {        
        if (tableEntity.after.toUpperCase().startsWith("INSERT"))
            returnValue[`${tab()}Something to do after for ${tableEntity.table}`] = await connectionDb
                .raw(tableEntity.after)
                .then(() => "✔")
                .catch((error: Error) => { console.log (error);return error.message});
    }

    // CREATE SOMETHING AFTER (migration)
    if (doAfter) {
            returnValue[`${tab()} doAfter ${tableEntity.table}`] = await connectionDb
                .raw(doAfter)
                .then(() => "✔")
                .catch((error: Error) => error.message);
    }

    return returnValue;
}