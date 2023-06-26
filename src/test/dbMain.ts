/**
 * Knex.js database sensorthings client and query builder for PostgreSQL.
 *
 * @see https://knexjs.org/
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import knex from "knex";
const config = require("../server/configuration/test.json");

export const dbTest = knex({
    client: "pg",
    connection: {
        host: config[TEST].pg_host,
        user: config[TEST].pg_user,
        password: config[TEST].pg_password,
        database: "test",
        port: config[TEST].pg_port
    },
    pool: {
        min: 0,
        log: (msg: string, level: string) => {
            console.log(`${level} : ${msg}`);
        }
    }
});
