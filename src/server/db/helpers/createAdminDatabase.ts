/**
 * createAdminDataBase.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import knex from "knex";
import koa from "koa";
import { createTable } from ".";
import { _CONFIGS, _CONFIGURATION } from "../../configuration";
import { asyncForEach, encrypt } from "../../helpers";
import { message } from "../../logger";
import { MODES } from "../../types";
import { _DBADMIN, _DBDATAS } from "../constants";
import { IUser } from "../interfaces";

 
 export const createAdminDataBase = async(configName: string, ctx?: koa.Context): Promise<{ [key: string]: string }> => {
    message(false, MODES.HEAD, "createAdminDataBase", "createDatabase");

    // init result
    const config = _CONFIGS[configName];
    const returnValue = { "Start create Database": config.pg_database };
    // create blank DATABASE
    const adminConnection = knex({
        client: "pg",
        connection: _CONFIGURATION.createKnexConnection("admin", "postgres"),
        pool: { min: 0, max: 7 },
        debug: false
    });

    if (adminConnection)
        await adminConnection
            .raw(`CREATE Database ${config.pg_database}`)
            .then(async () => {
                returnValue["create Admin DB"] = "✔";
                returnValue["User"] = await adminConnection
                    .raw(`select count(*) FROM pg_user WHERE usename = '${config.pg_user}';`)
                    .then(async (res) => {
                        if (res.rowCount < 1) {
                            message(false, MODES.INFO, "Create User", config.pg_user);
                            return adminConnection
                                .raw(`CREATE ROLE ${config.pg_user} WITH PASSWORD '${config.pg_password}' SUPERUSER;`)
                                .then(() => {
                                    adminConnection.destroy();
                                    return "Create User ✔";
                                })
                                .catch((err: Error) => err.message);
                        } else {
                            message(false, MODES.INFO, "Update User", config.pg_user);
                            return await adminConnection
                                .raw(`ALTER ROLE ${config.pg_user} WITH PASSWORD '${config.pg_password}' SUPERUSER;`)
                                .then(() => {
                                    adminConnection.destroy().catch((err: Error) => err.message);
                                    adminConnection.destroy();
                                    return "Update User ✔";
                                })
                                .catch((err: Error) => err.message);
                        }
                    });
            })
            .catch((err: Error) => err.message);

    // create tables    
    await asyncForEach(Object.keys(_DBADMIN), async (keyName: string) => {
        await createTable(knex({
            client: "pg",
            connection: _CONFIGURATION.createKnexConnection("admin"),
            pool: { min: 0, max: 7 },
            debug: false
        }), _DBADMIN[keyName], undefined);
    });

    // CREATE USER
    const user: IUser = {
        username: config.pg_user,
        email: "default@email.com",
        password: config.pg_password,
        database: "all",
        canPost: true,
        canDelete: true,
        canCreateUser: true,
        canCreateDb: true,
        superAdmin: false,
        admin: false
    };

    await knex({
        client: "pg",
        connection: _CONFIGURATION.createKnexConnection("admin"),
        pool: { min: 0, max: 7 },
        debug: false
    }).table("user").insert({
        username: user.username,
        email: user.email,
        password: encrypt(user.password),
        database: user.database || "all",
        canPost: user.canPost || false,
        canDelete: user.canDelete || false,
        canCreateUser: user.canCreateUser || false,
        canCreateDb: user.canCreateDb || false,
        superAdmin: user.superAdmin || false,
        admin: user.admin || false
    });
    return returnValue;
}
