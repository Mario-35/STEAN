/**
 * Knex.js database connection for PostgreSQL.
 *
 * @see https://knexjs.org/
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import { CONFIGURATION } from "../configuration";
 
 export const db = CONFIGURATION.createAllConnections();