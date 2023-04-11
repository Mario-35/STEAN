/**
 * createAdminDataBase.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { createTable } from ".";
import { _CONFIGS, _CONFIGURATION } from "../../configuration";
import { asyncForEach } from "../../helpers";
import { message } from "../../logger";
import { MODES } from "../../types";
import { _DBADMIN, _DBDATAS, _RIGHTS } from "../constants";
// import { IUser } from "../interfaces";

 
 export const createAdminDataBase = async(configName: string, ctx?: koa.Context): Promise<{ [key: string]: string }> => {
    message(false, MODES.HEAD, "createAdminDataBase", "createDatabase");

    // init result
    const config = _CONFIGS[configName];
    const returnValue = { "Start create Database": config.pg_database };
    // create blank DATABASE

    if (_CONFIGURATION.postgresConnection)
        await _CONFIGURATION.postgresConnection
            .raw(`CREATE Database ${config.pg_database}`)
            .then(async () => {
                returnValue["create Admin DB"] = "✔";
                returnValue["User"] = await _CONFIGURATION.postgresConnection
                    .raw(`select count(*) FROM pg_user WHERE usename = '${config.pg_user}';`)
                    .then(async (res) => {
                        if (res.rowCount < 1) {
                            message(false, MODES.INFO, "Create User", config.pg_user);
                            return _CONFIGURATION.postgresConnection
                                .raw(`CREATE ROLE ${config.pg_user} WITH PASSWORD '${config.pg_password}' ${_RIGHTS};`)
                                .then(() => {
                                    _CONFIGURATION.postgresConnection.destroy();
                                    return "Create User ✔";
                                })
                                .catch((err: Error) => err.message);
                        } else {
                            message(false, MODES.INFO, "Update User", config.pg_user);
                            return await _CONFIGURATION.postgresConnection
                                .raw(`ALTER ROLE ${config.pg_user} WITH PASSWORD '${config.pg_password}' ${_RIGHTS};`)
                                .then(() => {
                                    _CONFIGURATION.postgresConnection.destroy().catch((err: Error) => err.message);
                                    _CONFIGURATION.postgresConnection.destroy();
                                    return "Update User ✔";
                                })
                                .catch((err: Error) => err.message);
                        }
                    });
            })
            .catch((err: Error) => err.message);

    // create tables   
    const conn = _CONFIGURATION.getKnexConnection(_CONFIGURATION.getStringConnection("admin"));

    await asyncForEach(Object.keys(_DBADMIN), async (keyName: string) => {
        await createTable(conn, _DBADMIN[keyName], undefined);
    });
    return returnValue;
}
