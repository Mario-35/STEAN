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
        host: config["test"].pg.host,
        user: config["test"].pg.user,
        password: config["test"].pg.password,
        database: "test",
        port: config["test"].pg.port
    },
    pool: {
        min: 0,
        log: (err: string, level: string) => {
            console.log(`${level} : ${err}`);
        }
    }
});
