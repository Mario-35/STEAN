/**
 * getDBDateNow.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";

export const getDBDateNow = async (conn: Knex | Knex.Transaction): Promise<string> => { 
    const tempQuery = await conn.raw("SELECT current_timestamp;"); 
    return tempQuery["rows"][0]["current_timestamp"]; 
};
