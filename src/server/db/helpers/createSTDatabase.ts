/**
 * createSTDatabase.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import knex from "knex";
import koa from "koa";
 import { createTable, testConnection } from ".";
 import { _CONFIGS, _CONFIGURATION } from "../../configuration";
 import { asyncForEach, isTest } from "../../helpers";
 import { _LOGS } from "../../logger";
 import { _DBST, _RIGHTS } from "../constants";
 import { datasDemo } from "../createDBDatas/datasDemo";
 import { triggers } from "../createDBDatas/triggers";
 
 export const createSTDatabase = async(configName: string, ctx?: koa.Context): Promise<{ [key: string]: string }> => {
      _LOGS.head("createDatabase", "createDatabase");
      // init result
     const returnValue: { [key: string]: string } = { "Start create Database": _CONFIGS[configName].pg_database };
     const adminConnection = _CONFIGURATION.getKnexConnection(_CONFIGURATION.getStringConnection("admin", "postgres"));
 
     // Test connection Admin
     if (!testConnection(adminConnection)) {
         returnValue["DROP Error"] = "No Admin connection";
         return returnValue;
     }
 
     // in case of test always destroy DB
     if (_CONFIGS[configName].pg_database === "test") {
         returnValue[`DROP Database`] = await adminConnection
             .raw(`DROP Database IF EXISTS ${_CONFIGS[configName].pg_database}`)
             .then(() => "✔")
             .catch((err: Error) => err.message);
     }
 
     // create blank DATABASE
     await adminConnection
         .raw(`CREATE Database ${_CONFIGS[configName].pg_database}`)
         .then(async () => {
             returnValue[`Create Database`] = `${_CONFIGS[configName].pg_database} ✔`;
             // create USER if not exist
             await adminConnection.raw(`select count(*) FROM pg_user WHERE usename = '${_CONFIGS[configName].pg_user}';`).then(async (res: any) => {
                 if (res.rows[0].count == 0) {
                     returnValue[`CREATE ROLE ${_CONFIGS[configName].pg_user}`] = await adminConnection .raw(`CREATE ROLE ${_CONFIGS[configName].pg_user} WITH PASSWORD '${_CONFIGS[configName].pg_password}' ${_RIGHTS};`)
                         .then(() => "✔")
                         .catch((err: Error) => err.message);
                 } else {
                     await adminConnection
                         .raw(`ALTER ROLE ${_CONFIGS[configName].pg_user} WITH PASSWORD '${_CONFIGS[configName].pg_password}' ${_RIGHTS};`)
                         .then(() => {
                             returnValue[`Create/Alter ROLE`] = `${_CONFIGS[configName].pg_user} ✔`;
                             adminConnection
                                 .destroy()
                                 .then(() => {
                                     returnValue[`Admin connection destroy`] = "✔";
                                 })
                                 .catch((err: Error) => {
                                     returnValue[`Admin connection destroy`] = "✖";
                                     _LOGS.error(err.message);
                                 });
                         })
                         .catch((err: Error) => {
                             _LOGS.error(err);
                         });
                 }
             });
         }).catch((err: Error) => {
             _LOGS.error(err);
         });
 
    const connDb = knex({
        client: "pg",
        connection: {
            host: _CONFIGS["admin"].pg_host,
            user: _CONFIGS["admin"].pg_user,
            password: _CONFIGS["admin"].pg_password,
            database: _CONFIGS[configName].pg_database
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
         
     await asyncForEach(Object.keys(_DBST), async (keyName: string) => {
         await createTable(connDb, _DBST[keyName], undefined);
     });

     await asyncForEach(triggers, async (sql: string) => {
        returnValue["Create functions & trigger"] = await connDb
        .raw(sql.split("\n").join(""))
        .then(() => "✔")
        .catch((error: any) => {
            console.log(error);
            return error;
        });
    });
 
    if (isTest()) await asyncForEach(datasDemo(), async (sql: string) => {
        returnValue["Feed datas"] = await connDb
        .raw(sql.split("\n").join(""))
        .then(() => "✔")
        .catch((error: any) => {
            console.log(error);
            return error;
        });
    });
 
     await connDb.raw(`select count(*) FROM pg_user WHERE usename = '${_CONFIGS[configName].pg_user}';`).then(() => {
         returnValue["Create DB"] = "✔";
     });
     
     connDb.destroy();
     return returnValue;
 };