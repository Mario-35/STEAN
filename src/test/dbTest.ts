/**
 * Knex.js database sensorthings client and query builder for PostgreSQL.
 *
 * @see https://knexjs.org/
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import knex from "knex";
const _CONFIGURATION = require("../server/config/config.json")["test"];

export const dbTest = knex({
    client: "pg",
    connection: {
        host: _CONFIGURATION["test"].pg_host,
        user: _CONFIGURATION["test"].pg_user,
        password: _CONFIGURATION["test"].pg_password,
        database: "test",
        port: _CONFIGURATION["test"].pg_port
    },
    pool: {
        min: 0,
        log: (msg: string, level: string) => {
            console.log(`${level} : ${msg}`);
        }
    }
});
