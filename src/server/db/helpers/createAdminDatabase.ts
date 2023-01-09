/**
 * createAdminDatabase.
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
import { _DBADMIN, _DBDATAS } from "../constants";
import { IUser } from "../interfaces";

 
 export const createAdminDatabase = async(configName: string, ctx?: koa.Context): Promise<{ [key: string]: string }> => {
    message(false, "HEAD", "createAdminDatabase", "createDatabase");

    // init result
    const config = _CONFIGS[configName];
    const returnValue = { "Start create Database": config.pg_database };
    // create blank DATABASE
    const myAdminConnection = knex({
        client: "pg",
        connection: _CONFIGURATION.createKnexConnection("admin", "postgres"),
        pool: { min: 0, max: 7 },
        debug: false
    });

    if (myAdminConnection)
        await myAdminConnection
            .raw(`CREATE Database ${config.pg_database}`)
            .then(async () => {
                returnValue["create Admin DB"] = "✔";
                returnValue["User"] = await myAdminConnection
                    .raw(`select count(*) FROM pg_user WHERE usename = '${config.pg_user}';`)
                    .then(async (res) => {
                        if (res.rowCount < 1) {
                            message(false, "INFO", "Create User", config.pg_user);
                            return myAdminConnection
                                .raw(`CREATE ROLE ${config.pg_user} WITH PASSWORD '${config.pg_password}' SUPERUSER;`)
                                .then(() => {
                                    myAdminConnection.destroy();
                                    return "Create User ✔";
                                })
                                .catch((err: Error) => err.message);
                        } else {
                            message(false, "INFO", "Update User", config.pg_user);
                            return await myAdminConnection
                                .raw(`ALTER ROLE ${config.pg_user} WITH PASSWORD '${config.pg_password}' SUPERUSER;`)
                                .then(() => {
                                    myAdminConnection.destroy().catch((err: Error) => err.message);
                                    myAdminConnection.destroy();
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
