/**
 * Configuration class.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import fs from "fs";
import { API_VERSION, APP_NAME, APP_VERSION, NODE_ENV, setDebug, TIMESTAMP } from "../constants";
import { Logs } from "../logger";
import { asyncForEach, decrypt, encrypt, hidePasswordInJson, isTest } from "../helpers";
import util from "util";
import Koa from "koa";
import { app } from "..";
import { db } from "../db";
import knex, { Knex } from "knex";
import { createDatabase } from "../db/helpers";
import pg from "pg";
import update from "./update.json";
import { messages, messagesReplace } from "../messages";
import { IconfigFile, IdbConnection, Iuser } from "../types";
import { _DB } from "../db/constants";
import { apiType } from "../enums";


// class to create configs environements
class Configuration {
    static connections: { [key: string]: Knex<any, unknown[]> } = {};
    public list: { [key: string]: IconfigFile; } = {};
    static filePath: fs.PathOrFileDescriptor;
    static jsonConfiguration: JSON;
    static ports: number[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(file: fs.PathOrFileDescriptor) {   
        Configuration.filePath = file;    
        const fileTemp = fs.readFileSync(file, "utf8");    
        Configuration.jsonConfiguration = JSON.parse(fileTemp);
        Object.keys(Configuration.jsonConfiguration).forEach((element: string) => {
            this.list[element] = this.format(Configuration.jsonConfiguration[element], element);
            const tempConnection = this.getKnexConnection(element);
            if (tempConnection) Configuration.connections[element] = tempConnection;
        });
        Configuration.connections["postgres"] = this.createAdimnTableForDatabase("postgres");
        Configuration.connections["admin"] = this.createAdimnTableForDatabase("admin");
        this.logToFile(this.list["admin"]["logFile"]);
        Logs.booting("active error to file", "errorFile.md");
        const errFile = fs.createWriteStream("errorFile.md", { flags: 'w' });
        errFile.write(`## Start : ${TIMESTAMP()} \n`);
    }

    getConnections () {
        return Configuration.connections;
    }    

    createAdimnTableForDatabase(database: string) {        
        return knex({
            client: "pg",
            connection: {
                host: this.list["admin"].pg_host,
                user: this.list["admin"].pg_user,
                password: this.list["admin"].pg_password,
                database: database,
            },
            pool: { min: 0, max: 7 },
            debug: false
        });
    }

    logToFile(file: string) {        
        const active = file && file.length > 0 ? true: false;
        if (active) Logs.head("active Logs to file", file);
      
        if (active === false) return;
        setDebug(active);
        // Or 'w' to truncate the file every time the process starts.
        const logFile = fs.createWriteStream(file, { flags: 'a' });
      
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log = function (...data: any[]) {
          logFile.write(util.format.apply(null, data).replace(/\u001b[^m]*?m/g,"") + '\n');
          if (!isTest())process.stdout.write(util.format.apply(null, data) + '\n');
        };
        console.error = console.log;
      }

    // create user in admin DB
    async createUser(connectName: string) {
        const user:Iuser = {
            username: this.list[connectName].pg_user,
            email: "default@email.com",
            password: encrypt(this.list[connectName].pg_password),
            database: this.list[connectName].pg_database,
            canPost: true,
            canDelete: true,
            canCreateUser: true,
            canCreateDb: true,
            superAdmin: false,
            admin: false
        };
         Logs.class(messages.infos.updateUser, user.username);   
        await db.admin.table("user").count().where({username: user.username}).then(async (res: object) => {
            // recreate if exist because if you change key encrypt have to change  
            if (res[0].count == 1) {
                Logs.booting(messages.infos.updateUser, `${user.username} for ${connectName}`);
                await db.admin.table("user").update(user).where({username: user.username});
            } else {
                 Logs.booting(messages.infos.createAdminUser, `${user.username} for ${connectName}`);
                await db.admin.table("user").insert(user);
            }
        }).catch((err: Error) => {
            Logs.error(err);
        });
    }

    getConfigNameFromDatabase(input: string): string | undefined {  
        const aliasName = Object.keys(this.list).filter((configName: string) => this.list[configName].pg_database === input)[0];         
        if (aliasName) return aliasName;
        throw new Error(`No configuration found for ${input} name`);
    }

    getConfigNameFromContext(ctx: Koa.Context): string | undefined {
        const port = ctx.req.socket.localPort;
        if (port) {
            const databaseName = isTest() ? ["test"] : Object.keys(this.list).filter((word) => (word != "test" && this.list[word].port) == port);
            if (databaseName && databaseName.length === 1) return databaseName[0];
        }
        const name = ctx.originalUrl.split(ctx._version)[0].split("/").filter((e: string) => e != "")[0]; 
               
        if (name) {
            const databaseName = isTest() ? "test" : Object.keys(this.list).includes(name) ? name: undefined;
            if (databaseName) return databaseName;
            let aliasName: undefined | string = undefined;
            Object.keys(this.list).forEach((configName: string) => { if(this.list[configName].alias.includes(name)) aliasName = configName;});        
            if (aliasName) return aliasName;
            throw new Error(port ? `No configuration found for ${port} port or ${name} name` :`No configuration found for ${name} name`);
        }
        throw new Error(port ? `No configuration found for ${port} port or name missing` :`name missing`);
    }

    format(input: object, name?: string): IconfigFile {
        // If config encrypted
        Object.keys(input).forEach((elem: string) => {input[elem] = decrypt(input[elem]);});
        const goodDbName = name ? name : decrypt(input["pg_database"]) || "ERROR";
        const multi = input["multiDatastream"] ? input["multiDatastream"] : false;
        const lora = input["lora"] ? input["lora"] : false;
        const returnValue: IconfigFile = {
            name: goodDbName,
            port: input["port"] ? +input["port"] : -1,
            pg_host: input["pg_host"] || "ERROR",
            pg_port: input["pg_port"] ? +input["pg_port"] : 5432,
            pg_user: input["pg_user"] || "ERROR",
            pg_password: input["pg_password"] || "ERROR",
            pg_database: name && name === "test" ? "test" : input["pg_database"] || "ERROR",
            apiVersion: input["apiVersion"] || API_VERSION,
            date_format: input["date_format"] || "DD/MM/YYYY hh:mi:ss",
            webSite: input["webSite"] || "no web site",
            nb_page: input["nb_page"] ? +input["nb_page"] : 200,
            forceHttps: input["forceHttps"] ? input["forceHttps"] : false,
            alias: input["alias"] ? String(input["alias"]).split(",") : [],
            retry: input["retry"] ? +input["retry"] : 2,
            lora: input["lora"] ? input["lora"] : false,
            highPrecision: input["highPrecision"] ? input["highPrecision"] : false,
            multiDatastream: multi,
            logFile: input["log"] ? input["log"] : "",
            entities: this.createBlankEntities(multi, lora)
        };
        if (Object.values(returnValue).includes("ERROR")) throw new TypeError(`${messages.errors.configFile} [${util.inspect(returnValue, { showHidden: false, depth: null })}]`);
        return returnValue;
    }

    createBlankEntities(multi: boolean, lora: boolean) {
        return Object.keys(_DB).filter(e => _DB[e].essai.includes(apiType.base)
        || (_DB[e].essai.includes(apiType.multiDatastream) && multi === true)
        || (_DB[e].essai.includes(apiType.lora) && lora === true)
    );
    }

    createBlankConfig(base: string): IconfigFile {
        return {
            name: "name",
            port: this.list[base].port,
            pg_host: "host",
            pg_port: 5432,
            pg_user: "user",
            pg_password: "password",
            pg_database: "database",
            apiVersion: this.list[base].apiVersion,
            date_format: "DD/MM/YYYY hh:mi:ss",
            webSite: "no web site",
            nb_page: 200,
            forceHttps: false,
            alias: [],
            retry: this.list[base].retry,
            lora: false,
            highPrecision: false,
            multiDatastream: false,
            logFile: "",      
            entities: this.createBlankEntities(true, false)
        };
    }

    // add new config and create database if not exist
    async add(addJson: object): Promise<IconfigFile> {
        const tempConfig = this.format(addJson);
        const input = Configuration.jsonConfiguration.hasOwnProperty(NODE_ENV) ? Configuration.jsonConfiguration[NODE_ENV] : Configuration.jsonConfiguration;    
        input[tempConfig.name] = tempConfig;
    
         fs.writeFile(Configuration.filePath, JSON.stringify(input, null, 4), err => {
            if (err) {
              console.error(err);
              return false;
            }
            
          });
          this.list[tempConfig.name] = tempConfig;
          await this.addToServer(app , tempConfig.name);
          db[tempConfig.name] = this.getKnexConnection(tempConfig.name);
          hidePasswordInJson(tempConfig);
         return tempConfig;
    }

    getStringConnection(configName: string): IdbConnection {
        const returnValue = {
            host: this.list[configName].pg_host || "ERROR",
            user: this.list[configName].pg_user || "ERROR",
            password: this.list[configName].pg_password || "ERROR",
            database: this.list[configName].pg_database || "ERROR",
            port: this.list[configName].pg_port ? +String(this.list[configName].pg_port) : -1,
            retry: +String(this.list[configName].retry) || 2    
        };
        if (Object.values(returnValue).includes("ERROR")) throw new TypeError(`${messages.errors.configFile} [${returnValue}]`);
        return returnValue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getKnexConnection(connection: IdbConnection | string): Knex<any, unknown[]> {
        if (typeof connection === "string") connection = this.getStringConnection(connection);
        return knex({
            client: "pg",
            connection: {... connection, application_name: `${APP_NAME} ${APP_VERSION}`},
            pool: { min: 0, max: 7 },
            debug: false,            
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createAllConnections(): { [key: string]: Knex<any, unknown[]> } {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const returnValue: { [key: string]: Knex<any, unknown[]> } = {};
        Object.keys(this.list).forEach((key: string) => {
            const tempConnection = CONFIGURATION.getKnexConnection(key);
            if (tempConnection) returnValue[key] = tempConnection;
        });
        return returnValue;
    }
     
    async addToServer(app: Koa<Koa.DefaultState, Koa.DefaultContext>, key: string): Promise<boolean> {   
        await this.isDbExist(key, true)
            .then(async (res: boolean) => {   
                await CONFIGURATION.createUser(key);
                  const port = this.list[key].port;
                  if (port > 0) {
                      if (Configuration.ports.includes(port)) Logs.result(`\x1b[35m[${key}]\x1b[32m ${messages.infos.addPort}`, port);
                      else app.listen(port, () => {
                        Configuration.ports.push(port);
                        Logs.result(`\x1b[33m[${key}]\x1b[32m ${messages.infos.ListenPort}`, port);
                    });
                  }
                  return res;
                  
              })
              .catch((error: Error) => {
                  Logs.error(messages.errors.unableFindCreate, this.list[key].pg_database);
                  console.log(error);
                  process.exit(111);
              });
              return false;
    }    

    async isDbExist(connectName: string, create: boolean): Promise<boolean> {
         Logs.booting(messages.infos.connectName, connectName);
        const connection: IdbConnection = this.getStringConnection(connectName);
        await this.pgwait(connection);
        const tempConnection = this.getKnexConnection(connection);
         if (!tempConnection) return false;
         return await tempConnection
             .raw("select 1+1 as result")
             .then(async () => {
                const listTempTables = await tempConnection.raw("SELECT array_agg(table_name) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE 'temp%';");
                const tables = listTempTables.rows[0].array_agg;
                if (tables) Logs.result(`delete temp tables ==> \x1b[33m${connectName}\x1b[32m`, await tempConnection.raw(`DROP TABLE ${tables.slice(0, -1).slice(1).split(',')}`).then(() => "✔").catch((err: Error) => err.message));
                if (update) {
                    const list = update["database"];
                    await asyncForEach(list, async (operation: string) => {
                         Logs.result(`configuration ==> \x1b[33m${connectName}\x1b[32m`, await tempConnection.raw(operation).then(() => "✔").catch((err: Error) => err.message));
                    }); 
                 } 
                 tempConnection.destroy();
                 return true;
             })
             .catch(async (err: Error) => {
                 let returnResult = false;
                 if (err["code"] === "28P01" ) {
                    console.log("error connection");
                    console.log(connection);
                    
                 } else if (err["code"] === "3D000" && create == true) {
                     Logs.debug(messagesReplace(messages.infos.tryCreate, [messages.infos.db]), this.list[connectName].pg_database);
                     returnResult = await createDatabase(connectName)
                         .then(async () => {
                              Logs.result(`${messages.infos.db} ${messages.infos.create} [${this.list[connectName].pg_database}]`, "OK");
                             return true;
                         })
                         .catch((err: Error) => {
                             Logs.error(messagesReplace(messages.infos.create, [messages.infos.db]), err.message);
                             return false;
                         });
                 } else Logs.error(err);
                 tempConnection.destroy();
                 return returnResult;
             });
     }  

    async pgwait(options: IdbConnection): Promise<boolean> {
        const pool = new pg.Pool({... options, database: "postgres" });
        let passage = 1;
   
        const connect = async (): Promise<boolean> => {
                try {
                    await pool.query('SELECT 1');
                     Logs.result(messagesReplace(messages.infos.dbOnline, [options.database || "none"]), TIMESTAMP());
                    await pool.end();
                    return true;
                }   
                catch (e) {
                    // if (passage === 1)  Logs.result( messagesReplace(messages.infos.dbOnline, [options.database || "none"]), timeStamp());
                    return false;
                }
        };
        let testConnection = false;
        const end = Number(Date.now()) + options.retry * 1000;
        do {        
            testConnection = await connect();
            passage += passage;
        } while (testConnection === false && Number(Date.now()) < end);
        return testConnection;
    }
}

export const CONFIGURATION = new Configuration(__dirname + `/${NODE_ENV}.json`);

