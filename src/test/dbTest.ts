/**
 * Knex.js database sensorthings client and query builder for PostgreSQL.
 *
 * @see https://knexjs.org/
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import knex from "knex";
import { TEST } from "../server/constants";
const serverConfig = require("../server/configuration/test.json");

export const dbTest = knex({
    client: "pg",
    connection: {
        host: serverConfig[TEST].pg_host,
        user: serverConfig[TEST].pg_user,
        password: serverConfig[TEST].pg_password,
        database: "test",
        port: serverConfig[TEST].pg_port
    },
    pool: {
        min: 0,
        log: (msg: string, level: string) => {
            console.log(`${level} : ${msg}`);
        }
    }
});
