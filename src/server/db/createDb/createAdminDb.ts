/**
 * createAdminDB.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createTable } from "../helpers";
import { CONFIGURATION } from "../../configuration";
import { asyncForEach } from "../../helpers";
import { Logs } from "../../logger";
import { _DBADMIN, _RIGHTS } from "../constants";
import { db } from "..";
 
export const createAdminDB = async(configName: string): Promise<{ [key: string]: string }> => {
    Logs.head("createAdminDB", "createDatabase");

    // init result
    const config = CONFIGURATION.list[configName];
    const returnValue = { "Start create Database": config.pg_database };
    // create blank DATABASE

    if (db["postgres"])
        await db["postgres"]
            .raw(`CREATE Database ${config.pg_database}`)
            .then(async () => {
                returnValue["create Admin DB"] = "✔";
                returnValue["User"] = await db["postgres"]
                    .raw(`SELECT count(*) FROM pg_user WHERE usename = '${config.pg_user}';`)
                    .then(async (res) => {
                        if (res.rowCount < 1) {
                            Logs.infoSystem("Create User", config.pg_user);
                            return db["postgres"]
                                .raw(`CREATE ROLE ${config.pg_user} WITH PASSWORD '${config.pg_password}' ${_RIGHTS};`)
                                .then(() => {
                                    db["postgres"].destroy();
                                    return "Create User ✔";
                                })
                                .catch((err: Error) => err.message);
                        } else {
                            Logs.infoSystem("Update User", config.pg_user);
                            return await db["postgres"]
                                .raw(`ALTER ROLE ${config.pg_user} WITH PASSWORD '${config.pg_password}' ${_RIGHTS};`)
                                .then(() => {
                                    db["postgres"].destroy().catch((err: Error) => err.message);
                                    db["postgres"].destroy();
                                    return "Update User ✔";
                                })
                                .catch((err: Error) => err.message);
                        }
                    });
            })
            .catch((err: Error) => err.message);

    // create tables   
    const conn = CONFIGURATION.getKnexConnection(CONFIGURATION.getStringConnection("admin"));

    await asyncForEach(Object.keys(_DBADMIN), async (keyName: string) => {
        await createTable(conn, _DBADMIN[keyName], undefined);
    });
    return returnValue;
};
