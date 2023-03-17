/**
 * testConnection.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";
import { message } from "../../logger";
import { MODES } from "../../types";

export const testConnection = async (instance: Knex<any, unknown[]>): Promise<boolean> => {
    message(true, MODES.INFO, "testConnection", instance.toString());

    await instance.raw("select 1+1 as result").catch((err) => {
        message(true, MODES.ERROR, "testConnection", err);
        return false;
    });
    message(true, MODES.INFO, "testConnection", "OK");
    return true;
};
