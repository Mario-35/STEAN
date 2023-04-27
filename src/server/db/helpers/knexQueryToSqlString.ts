/**
 * knexQueryToSqlString.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

/**
 *
 * @param query: Knex.QueryBuilder
 * @returns a string with bindings datas
 */

import { Knex } from "knex";

export const knexQueryToSqlString = (query: Knex.QueryBuilder): string => {
    const tempSqlNative = query.toSQL().toNative();
    let sql = tempSqlNative.sql;

    tempSqlNative.bindings.forEach((Element: Knex.Value, index: number) => {
        sql = sql.split(`$${index + 1}`).join(<string>Element);
    });

    return sql;
};
