/**
 * testConnection.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";
import { Logs } from "../../logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const testConnection = async (instance: Knex<any, unknown[]>): Promise<boolean> => {
    Logs.debug("testConnection", instance.toString());

    await instance.raw("select 1+1 as result").catch((err) => {
        Logs.error("testConnection", err);
        return false;
    });
    Logs.debug("testConnection", "OK");
    return true;
};
