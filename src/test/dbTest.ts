/**
 * Knex.js database sensorthings client and query builder for PostgreSQL.
 *
 * @see https://github.com/porsager/postgres
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */
// console.log("!----------------------------------- Knex.js database sensorthings client and query builder for PostgreSQL. -----------------------------------!");
import postgres from "postgres";
import { TEST } from "../server/constants";
const config = require("../server/configuration/test.json");

export const dbTest = postgres(`postgres://${config["test"].pg.user}:${config["test"].pg.password}@${config["test"].pg.host}:${config["test"].pg.port || 5432}/${TEST}`,{});
