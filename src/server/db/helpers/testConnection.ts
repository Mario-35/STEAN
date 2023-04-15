/**
 * testConnection.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";
import { _LOGS } from "../../logger";

export const testConnection = async (instance: Knex<any, unknown[]>): Promise<boolean> => {
    _LOGS.debug("testConnection", instance.toString());

    await instance.raw("select 1+1 as result").catch((err) => {
        _LOGS.error("testConnection", err);
        return false;
    });
    _LOGS.debug("testConnection", "OK");
    return true;
};
