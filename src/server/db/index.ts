/**
 * Knex.js database connection for PostgreSQL.
 *
 * @see https://knexjs.org/
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

import { _CONFIGFILE } from "../configuration";
 
 export const db = _CONFIGFILE.createConnections();