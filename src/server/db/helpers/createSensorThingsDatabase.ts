/**
 * createSensorThingsDatabase.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

 import knex from "knex";
import koa from "koa";
 import { createTable, testConnection } from ".";
 import { _CONFIGFILE } from "../../configuration";
 import { asyncForEach } from "../../helpers";
 import { logDebug, message } from "../../logger";
 import { _DBDATAS } from "../constants";
 import { datasDemo } from "../createDBDatas/datasDemo";
 import { triggers } from "../createDBDatas/triggers";
  
  export const createSensorThingsDatabase = async(configName: string, ctx?: koa.Context): Promise<{ [key: string]: string }> => {
      message(true, "HEAD", "createDatabase", "createDatabase");
      const configFile = _CONFIGFILE[configName];
 
      // init result
     const  returnValue: { [key: string]: string } = { "Start create Database": configFile.pg_database };
     const adminCon =  knex({
        client: "pg",
        connection: {
            host: _CONFIGFILE["admin"]["pg_host"],
            user: _CONFIGFILE["admin"]["pg_user"],
            password: _CONFIGFILE["admin"]["pg_password"],
            database: "postgres",
            port: _CONFIGFILE["admin"]["pg_port"] ? +String(_CONFIGFILE["admin"]["pg_port"]) : -1
        },
        pool: { min: 0, max: 7 },
        debug: false
    });
 
     // Test connection Admin
     if (!testConnection(adminCon)) {
         returnValue["DROP Error"] = "No Admin connection";
         return returnValue;
     }
 
     // in case of test always destroy DB
     if (configFile.pg_database === "test") {
         returnValue[`DROP Database`] = await adminCon
             .raw(`DROP Database IF EXISTS ${configFile.pg_database}`)
             .then(() => "✔")
             .catch((err: Error) => err.message);
     }
 
     // create blank DATABASE
     await adminCon
         .raw(`CREATE Database ${configFile.pg_database}`)
         .then(async () => {
             returnValue[`Create Database`] = `${configFile.pg_database} ✔`;
             // create USER if not exist
             await adminCon.raw(`select count(*) FROM pg_user WHERE usename = '${configFile.pg_user}';`).then(async (res: any) => {
                 if (res.rowCount < 1) {
                     returnValue[`Create ROLE ${configFile.pg_user}`] = await adminCon
                         .raw(`CREATE ROLE ${configFile.pg_user} WITH PASSWORD '${configFile.pg_password}' SUPERUSER;`)
                         .then(() => "✔")
                         .catch((err: Error) => err.message);
                 } else {
                     await adminCon
                         .raw(`ALTER ROLE ${configFile.pg_user} WITH PASSWORD '${configFile.pg_password}' SUPERUSER;`)
                         .then(() => {
                             returnValue[`Create/Alter ROLE`] = `${configFile.pg_user} ✔`;
                             adminCon
                                 .destroy()
                                 .then(() => {
                                     returnValue[`Admin connection destroy`] = "✔";
                                 })
                                 .catch((err: Error) => {
                                     returnValue[`Admin connection destroy`] = "✖";
                                     message(false, "ERROR", err.message);
                                 });
 
                         })
                         .catch((err: Error) => {
                             logDebug(err);
                             message(false, "ERROR", err.message);
                         });
                 }
             });
         })
         .catch((err: Error) => {
             logDebug(err);
             message(false, "ERROR", err.message);
         });
 

      const connDb =  knex({
        client: "pg",
        connection: {
            host: _CONFIGFILE["admin"]["pg_host"],
            user: _CONFIGFILE["admin"]["pg_user"],
            password: _CONFIGFILE["admin"]["pg_password"],
            database: _CONFIGFILE[configName]["pg_database"]
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
 
     // create tables
     // const _DATAS = configFile.createUser && configFile.createUser == true ? _DBADMIN : _DBDATAS;
     await asyncForEach(Object.keys(_DBDATAS), async (keyName: string) => {
         await createTable(connDb, _DBDATAS[keyName], undefined);
     });
 
     returnValue["Create functions & trigger"] = await connDb
         .raw(triggers)
         .then(() => "✔")
         .catch((e: any) => e);
     if  (configName.toUpperCase() === "TEST" ||  (ctx && ctx.request.body.seed && ctx.request.body.seed === true)){
         datasDemo().forEach(async (sql: string) => {
             returnValue["Feed datas"] = await connDb
                 .raw(sql)
                 .then(() => "✔")
                 .catch((e: any) => {
                     console.log(e);
                     return e;
                 });
         });
     }
 
     await connDb.raw(`select count(*) FROM pg_user WHERE usename = '${configFile.pg_user}';`).then(() => {
         returnValue["Create DB"] = "✔";
     });
     
     return returnValue;
 }