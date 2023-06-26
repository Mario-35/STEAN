/**
 * createSTDB.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createTable } from "../helpers";
import { serverConfig } from "../../configuration";
import { asyncForEach, isTest } from "../../helpers";
import { Logs } from "../../logger";
import { _DB, _RIGHTS } from "../constants";
import { testsDatas } from "./testsDatas";
import { triggers } from "./triggers";
import { ADMIN } from "../../constants";
 
export const createSTDB = async(configName: string): Promise<{ [key: string]: string }> => {
    Logs.head("createDatabase", "createDatabase");
    // init result
    const config = serverConfig.configs[configName].pg;
    const returnValue: { [key: string]: string } = { "Start create Database": config.database };
    const adminConnection = serverConfig.db(ADMIN);
    // Test connection Admin
    if (!adminConnection) {
        returnValue["DROP Error"] = "No Admin connection";
        return returnValue;
    }

    // in case of test always destroy DB
    // if (isTest()) {
    //     returnValue[`DROP Database`] = await adminConnection
    //         .raw(`DROP Database IF EXISTS ${config.database}`)
    //         .then(() => "✔")
    //         .catch((err: Error) => err.message);
    // }

    // create blank DATABASE
    await adminConnection
        .raw(`CREATE Database ${config.database}`)
        .then(async () => {
            returnValue[`Create Database`] = `${config.database} ✔`;
            // create USER if not exist
            await adminConnection.raw(`select count(*) FROM pg_user WHERE usename = '${config.user}';`).then(async (res: object) => {
                if (res["rows"][0].count == 0) {
                    returnValue[`CREATE ROLE ${config.user}`] = await adminConnection.raw(`CREATE ROLE ${config.user} WITH PASSWORD '${config.password}' ${_RIGHTS};`)
                        .then(() => "✔")
                        .catch((err: Error) => err.message);
                } else {
                    await adminConnection
                        .raw(`ALTER ROLE ${config.user} WITH PASSWORD '${config.password}' ${_RIGHTS};`)
                        .then(() => {
                            returnValue[`Create/Alter ROLE`] = `${config.user} ✔`;
                        })
                        .catch((err: Error) => {
                            Logs.error(err);
                        });
                }
            });
        }).catch((err: Error) => {
            Logs.error(err);
        });

        const dbConnection = await serverConfig.waitConnection(configName);
        if (!dbConnection) {
            returnValue["DROP Error"] = "No DB connection";
            return returnValue;
        }
        
    // create postgis
    returnValue[`Create postgis`] = await dbConnection
        .raw("CREATE EXTENSION IF NOT EXISTS postgis;")
        .then(() => "✔")
        .catch((err: Error) => err.message);

    returnValue[`Create tablefunc`] = await dbConnection
        .raw("CREATE EXTENSION IF NOT EXISTS tablefunc;")
        .then(() => "✔")
        .catch((err: Error) => err.message);

    await asyncForEach(serverConfig.configs[configName].entities, async (keyName: string) => {
        await createTable(dbConnection, _DB[keyName], undefined);
    });

    await asyncForEach(triggers, async (sql: string) => {
    returnValue["Create functions & trigger"] = await dbConnection
    .raw(sql.split("\n").join(""))
    .then(() => "✔")
    .catch((error) => {
        Logs.error(error);
        return error;
    });
});

if (isTest()) await asyncForEach(testsDatas(), async (sql: string) => {
    returnValue["Feed datas"] = await dbConnection
    .raw(sql.split("\n").join(""))
    .then(() => "✔")
    .catch((error) => {
        Logs.error(error);
        return error;
    });
});

    await dbConnection.raw(`select count(*) FROM pg_user WHERE usename = '${config.user}';`).then(() => {
        returnValue["Create DB"] = "✔";
    });
    return returnValue;
};