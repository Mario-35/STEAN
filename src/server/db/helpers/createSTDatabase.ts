/**
 * createSTDatabase.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import knex from "knex";
 import { createTable, testConnection } from ".";
 import { CONFIGURATION } from "../../configuration";
 import { asyncForEach, isTest } from "../../helpers";
 import { Logs } from "../../logger";
 import { DBDATAS, _RIGHTS } from "../constants";
 import { datasDemo } from "../createDBDatas/datasDemo";
 import { triggers } from "../createDBDatas/triggers";
 
 export const createSTDatabase = async(configName: string): Promise<{ [key: string]: string }> => {
      Logs.head("createDatabase", "createDatabase");
      // init result
     const returnValue: { [key: string]: string } = { "Start create Database": CONFIGURATION.list[configName].pg_database };
     const adminConnection = CONFIGURATION.getKnexConnection(CONFIGURATION.getStringConnection("admin"));
 
     // Test connection Admin
     if (!testConnection(adminConnection)) {
         returnValue["DROP Error"] = "No Admin connection";
         return returnValue;
     }
 
     // in case of test always destroy DB
     if (CONFIGURATION.list[configName].pg_database === "test") {
         returnValue[`DROP Database`] = await adminConnection
             .raw(`DROP Database IF EXISTS ${CONFIGURATION.list[configName].pg_database}`)
             .then(() => "✔")
             .catch((err: Error) => err.message);
     }
 
     // create blank DATABASE
     await adminConnection
         .raw(`CREATE Database ${CONFIGURATION.list[configName].pg_database}`)
         .then(async () => {
             returnValue[`Create Database`] = `${CONFIGURATION.list[configName].pg_database} ✔`;
             // create USER if not exist
             await adminConnection.raw(`select count(*) FROM pg_user WHERE usename = '${CONFIGURATION.list[configName].pg_user}';`).then(async (res: object) => {
                 if (res["rows"][0].count == 0) {
                     returnValue[`CREATE ROLE ${CONFIGURATION.list[configName].pg_user}`] = await adminConnection .raw(`CREATE ROLE ${CONFIGURATION.list[configName].pg_user} WITH PASSWORD '${CONFIGURATION.list[configName].pg_password}' ${_RIGHTS};`)
                         .then(() => "✔")
                         .catch((err: Error) => err.message);
                 } else {
                     await adminConnection
                         .raw(`ALTER ROLE ${CONFIGURATION.list[configName].pg_user} WITH PASSWORD '${CONFIGURATION.list[configName].pg_password}' ${_RIGHTS};`)
                         .then(() => {
                             returnValue[`Create/Alter ROLE`] = `${CONFIGURATION.list[configName].pg_user} ✔`;
                             adminConnection
                                 .destroy()
                                 .then(() => {
                                     returnValue[`Admin connection destroy`] = "✔";
                                 })
                                 .catch((err: Error) => {
                                     returnValue[`Admin connection destroy`] = "✖";
                                     Logs.error(err.message);
                                 });
                         })
                         .catch((err: Error) => {
                             Logs.error(err);
                         });
                 }
             });
         }).catch((err: Error) => {
             Logs.error(err);
         });
 
    const connDb = knex({
        client: "pg",
        connection: {
            host: CONFIGURATION.list["admin"].pg_host,
            user: CONFIGURATION.list["admin"].pg_user,
            password: CONFIGURATION.list["admin"].pg_password,
            database: CONFIGURATION.list[configName].pg_database
        },
        pool: { min: 0, max: 7 },
        debug: false
    });

     // create postgis
     returnValue[`Create postgis`] = await connDb
         .raw("CREATE EXTENSION IF NOT EXISTS postgis;")
         .then(() => "✔")
         .catch((err: Error) => err.message);
 
     returnValue[`Create tablefunc`] = await connDb
         .raw("CREATE EXTENSION IF NOT EXISTS tablefunc;")
         .then(() => "✔")
         .catch((err: Error) => err.message);

     await asyncForEach(CONFIGURATION.list[configName].dbEntities, async (keyName: string) => {
         await createTable(connDb, DBDATAS[keyName], undefined);
     });

     await asyncForEach(triggers, async (sql: string) => {
        returnValue["Create functions & trigger"] = await connDb
        .raw(sql.split("\n").join(""))
        .then(() => "✔")
        .catch((error) => {
            Logs.error(error);
            return error;
        });
    });
 
    if (isTest()) await asyncForEach(datasDemo(), async (sql: string) => {
        returnValue["Feed datas"] = await connDb
        .raw(sql.split("\n").join(""))
        .then(() => "✔")
        .catch((error) => {
            Logs.error(error);
            return error;
        });
    });
 
     await connDb.raw(`select count(*) FROM pg_user WHERE usename = '${CONFIGURATION.list[configName].pg_user}';`).then(() => {
         returnValue["Create DB"] = "✔";
     });
     
     connDb.destroy();
     return returnValue;
 };