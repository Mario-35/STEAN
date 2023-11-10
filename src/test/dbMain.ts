/**
 * test postgres.js database connection for PostgreSQL.
 *
 * @see https://github.com/porsager/postgres
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import postgres from "postgres";
import config from "../server/configuration/test.json";

export const dbTest = postgres(`postgres://${config["test"].pg.user}:${config["test"].pg.password}@${config["test"].pg.host}:${config["test"].pg.port || 5432}/test`,{});

