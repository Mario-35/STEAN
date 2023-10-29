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
        host: serverConfig[TEST].pg.host,
        user: serverConfig[TEST].pg.user,
        password: serverConfig[TEST].pg.password,
        database: "test",
        port: serverConfig[TEST].pg.port
    },
    pool: {
        min: 0,
        log: (err: string, level: string) => {
            console.log(`${level} : ${err}`);
        }
    }
});
