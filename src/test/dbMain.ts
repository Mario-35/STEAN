/**
 * Knex.js database sensorthings client and query builder for PostgreSQL.
 *
 * @see https://knexjs.org/
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import knex from "knex";
const CONFIGURATION.list = require("../server/configuration/config.json")["test"];

export const dbTest = knex({
    client: "pg",
    connection: {
        host: CONFIGURATION.list["test"].pg_host,
        user: CONFIGURATION.list["test"].pg_user,
        password: CONFIGURATION.list["test"].pg_password,
        database: "test",
        port: CONFIGURATION.list["test"].pg_port
    },
    pool: {
        min: 0,
        log: (msg: string, level: string) => {
            console.log(`${level} : ${msg}`);
        }
    }
});
