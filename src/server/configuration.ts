/**
 * Index config.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import fs from "fs";
import { _APIVERSION, _appName, _appVersion, _NODE_ENV } from "./constants";
import { _LOGS } from "./logger";
import { asyncForEach, decrypt, hidePasswordInJson, isTest } from "./helpers";
import util from "util";
import Koa from "koa";
import { app } from ".";
import { db } from "./db";
import knex, { Knex } from "knex";
import { createDatabase } from "./db/helpers";
import pg from "pg";
import update from "./config/update.json";
import { messages, messagesReplace } from "./messages";
import { IUser } from "./types";


/**
 * ConfigFile interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

 interface IConfigFile {
    name: string; // item of the config file
    key?: string; // key for crypto
    crypt?: string;
    pg_host: string;
    pg_port: number;
    port: number;
    pg_user: string;
    pg_database: string;
    pg_password: string;
    apiVersion: string;
    date_format: string;
    webSite: string;
    nb_page: number;
    lineLimit: number;
    retry: number;
    createUser?: boolean;
    forceHttps: boolean;
    alias: string[];
    standard: boolean;
    logFile: string;
}

interface IDbConnection {
    host: string | undefined;
    user: string | undefined;
    password: string | undefined;
    database: string | undefined;
    port: number | undefined;
    retry: number;
}

class configuration {
    private configurationList: {
        [key: string]: IConfigFile;
    } = {};
    static filePath: fs.PathOrFileDescriptor;
    static jsonConfiguration: any;
    static ports: number[] = [];
    public postgresConnection: Knex<any, unknown[]>;
    constructor(file: fs.PathOrFileDescriptor) {   
        configuration.filePath = file;    
        const fileTemp = fs.readFileSync(file, "utf8");    
        configuration.jsonConfiguration = JSON.parse(fileTemp);
        const input = configuration.jsonConfiguration.hasOwnProperty(_NODE_ENV) ? configuration.jsonConfiguration[_NODE_ENV] : configuration.jsonConfiguration;   
        Object.keys(input).forEach((element: string) => (this.configurationList[element] = this.format(input[element], element)));
        this.postgresConnection = knex({
            client: "pg",
            connection: {
                host: this.configurationList["admin"].pg_host,
                user: this.configurationList["admin"].pg_user,
                password: this.configurationList["admin"].pg_password,
                database: "postgres",
            },
            pool: { min: 0, max: 7 },
            debug: false
        });
    }

    async createUser(connectName: string) {
        const user:IUser = {
            username: _CONFIGS[connectName].pg_user,
            email: "default@email.com",
            password: _CONFIGS[connectName].pg_password,
            database: _CONFIGS[connectName].pg_database,
            canPost: true,
            canDelete: true,
            canCreateUser: true,
            canCreateDb: true,
            superAdmin: false,
            admin: false
        };
         _LOGS.class(messages.infos.updateUser, user.username);   
        await db["admin"].table("user").count().where({username: user.username}).then(async (res: any) => {
            // recreate if exist because if you change key encrypt have to change  
            if (res[0].count == 1) {
                 _LOGS.head(messages.infos.updateUser, `${user.username} for ${connectName}`);
                await db["admin"].table("user").update(user).where({username: user.username});
            } else {
                 _LOGS.head(messages.infos.createAdminUser, `${user.username} for ${connectName}`);
                await db["admin"].table("user").insert(user);
            }
        }).catch((err: Error) => {
            console.log(err);
        });
    }

    getConfigNameFromDatabase(input: string): string | undefined {        
        let aliasName: undefined | string = undefined;
        Object.keys(_CONFIGS).forEach((configName: string) => { if(_CONFIGS[configName].pg_database === input) aliasName = configName;});        
        if (aliasName) return aliasName;
        throw new Error(`No configuration found for ${input} name`);
    }

    getConfigNameFromContext(ctx: Koa.Context): string | undefined {
        const port = ctx.req.socket.localPort;
        if (port) {
            const databaseName = isTest() ? ["test"] : Object.keys(_CONFIGS).filter((word) => (word != "test" && _CONFIGS[word].port) == port);
            if (databaseName && databaseName.length === 1) return databaseName[0];
        }
        const name = ctx.originalUrl.split(ctx._version)[0].split("/").filter((e: string) => e != "")[0]; 
               
        if (name) {
            const databaseName = isTest() ? "test" : Object.keys(_CONFIGS).includes(name) ? name: undefined;
            if (databaseName) return databaseName;
            let aliasName: undefined | string = undefined;
            Object.keys(_CONFIGS).forEach((configName: string) => { if(_CONFIGS[configName].alias.includes(name)) aliasName = configName;});        
            if (aliasName) return aliasName;
            throw new Error(port ? `No configuration found for ${port} port or ${name} name` :`No configuration found for ${name} name`);
        }
        throw new Error(port ? `No configuration found for ${port} port or name missing` :`name missing`);
    }

    // return config(s)
    getConfigs() {
        return this.configurationList;
    }

    isInConfig(key: string):boolean {
        return Object.keys(this.configurationList).includes(key.trim().toLowerCase()) ;  
    }

    format(input: JSON, name?: string): IConfigFile {
        Object.keys(input).forEach((elem: string) => {input[elem] = decrypt(input[elem]);});
        const returnValue = {
            name: name ? name : decrypt(input["pg_database"]) || "ERROR",
            port: input["port"] ? +input["port"] : -1,
            pg_host: input["pg_host"] || "ERROR",
            pg_port: input["pg_port"] ? +input["pg_port"] : 5432,
            pg_user: input["pg_user"] || "ERROR",
            pg_password: input["pg_password"] || "ERROR",
            pg_database: name && name === "test" ? "test" : input["pg_database"] || "ERROR",
            apiVersion: input["apiVersion"] || _APIVERSION,
            date_format: input["date_format"] || "DD/MM/YYYY hh:mi:ss",
            webSite: input["webSite"] || "no web site",
            nb_page: input["nb_page"] ? +input["nb_page"] : 200,
            lineLimit: input["lineLimit"] ? +input["lineLimit"] : 2000,
            forceHttps: input["forceHttps"] ? input["forceHttps"] : false,
            alias: input["alias"] ? String(input["alias"]).split(",") : [],
            retry: input["retry"] ? +input["retry"] : 2,
            standard: input["standard"] ? input["standard"] : false,
            logFile: input["logFile"] ? input["logFile"] : ""
        };
        if (Object.values(returnValue).includes("ERROR"))
            throw new TypeError(`${messages.errors.configFile} [${util.inspect(returnValue, { showHidden: false, depth: null })}]`);
    
        return returnValue;
    }

    // add new config and create database if not exist
    async add(addJson: any): Promise<IConfigFile> {
        const tempConfig = this.format(addJson);
        const input = configuration.jsonConfiguration.hasOwnProperty(_NODE_ENV) ? configuration.jsonConfiguration[_NODE_ENV] : configuration.jsonConfiguration;    
        input[tempConfig.name] = tempConfig;
    
         fs.writeFile(configuration.filePath, JSON.stringify(input, null, 4), err => {
            if (err) {
              console.error(err);
              return false;
            }
            
          });
          this.configurationList[tempConfig.name] = tempConfig;
          await this.addToServer(app , tempConfig.name);
          db[tempConfig.name] = this.getKnexConnection(tempConfig.name);
          hidePasswordInJson(tempConfig);
         return tempConfig;
    }

    getStringConnection(configName: string, database?: string): IDbConnection {
        const returnValue = {
            host: this.configurationList[configName].pg_host || "ERROR",
            user: this.configurationList[configName].pg_user || "ERROR",
            password: this.configurationList[configName].pg_password || "ERROR",
            database: this.configurationList[configName].pg_database || "ERROR",
            port: this.configurationList[configName].pg_port ? +String(this.configurationList[configName].pg_port) : -1,
            retry: +String(this.configurationList[configName].retry) || 2    
        };
        if (Object.values(returnValue).includes("ERROR")) throw new TypeError(`${messages.errors.configFile} [${returnValue}]`);
        return returnValue;
    }

    getKnexConnection(connection: IDbConnection | string): Knex<any, unknown[]> {
        if (typeof connection === "string") connection = this.getStringConnection(connection);
        return knex({
            client: "pg",
            connection: {... connection, application_name: `${_appName} ${_appVersion}`},
            pool: { min: 0, max: 7 },
            debug: false,            
        });
    }

    createAllConnections(): { [key: string]: Knex<any, unknown[]> } {
        const returnValue: { [key: string]: Knex<any, unknown[]> } = {};
        Object.keys(this.configurationList).forEach((key: string) => {
            const tempConnection = _CONFIGURATION.getKnexConnection(key);
            if (tempConnection) returnValue[key] = tempConnection;
        });
        return returnValue;
    }
     
    async addToServer(app: Koa<Koa.DefaultState, Koa.DefaultContext>, key: string): Promise<boolean> {   
        await this.isDbExist(key, true)
            .then(async (res: boolean) => {   
                await _CONFIGURATION.createUser(key);
                  const port = _CONFIGS[key].port;
                  if (port > 0) {
                      if (configuration.ports.includes(port)) _LOGS.result(`\x1b[35m[${key}]\x1b[32m ${messages.infos.addPort}`, port);
                      else app.listen(port, () => {
                        configuration.ports.push(port);
                               _LOGS.result(`\x1b[33m[${key}]\x1b[32m ${messages.infos.ListenPort}`, port);
                          });
                  }
                  return res;
                  
              })
              .catch((error: any) => {
                  _LOGS.error(messages.errors.unableFindCreate, _CONFIGS[key].pg_database);
                  console.log(error);
                  process.exit(111);
              });
              return false;
    }    

    async isDbExist(connectName: string, create: boolean): Promise<boolean> {
         _LOGS.booting(messages.infos.connectName, connectName);
        const connection: IDbConnection = this.getStringConnection(connectName);
        await this.pgwait(connection);
        const tempConnection = this.getKnexConnection(connection);
         if (!tempConnection) return false;
         return await tempConnection
             .raw("select 1+1 as result")
             .then(async () => {
                  _LOGS.result(messages.infos.dbOnline, _CONFIGS[connectName].pg_database);
                 if (update) {
                    const list = update["database"];
                    await asyncForEach(list, async (operation: string) => {
                         _LOGS.result(`configuration ==> \x1b[33m${connectName}\x1b[32m`, await tempConnection.raw(operation).then(() => "✔").catch((err: Error) => err.message));
                    }); 
                 } 
                 tempConnection.destroy();
                 return true;
             })
             .catch(async (err: any) => {
                 let returnResult = false;
                 if (err.code === "28P01" ) {
                    console.log("error connection");
                    console.log(connection);
                    
                 } else if (err.code === "3D000" && create == true) {
                     _LOGS.debug(messagesReplace(messages.infos.tryCreate, [messages.infos.db]), _CONFIGS[connectName].pg_database);
                     returnResult = await createDatabase(connectName)
                         .then(async () => {
                              _LOGS.result(`${messages.infos.db} ${messages.infos.create} [${_CONFIGS[connectName].pg_database}]`, "OK");
                             return true;
                         })
                         .catch((err: Error) => {
                             _LOGS.error(messagesReplace(messages.infos.create, [messages.infos.db]), err.message);
                             return false;
                         });
                 } else console.log(err);
                 tempConnection.destroy();
                 return returnResult;
             });
     }  

    async pgwait(options: IDbConnection): Promise<boolean> {
        const pool = new pg.Pool({... options, database: "postgres" });
        let passage = 1;
        const timeStamp = (): string => {
            const d = new Date();
            return d.toLocaleTimeString();
        };
    
        const connect = async (): Promise<boolean> => {
                try {
                    await pool.query('SELECT 1');
                     _LOGS.result(messagesReplace(messages.infos.dbOnline, [options.database || "none"]), timeStamp());
                    await pool.end();
                    return true;
                }   
                catch (e) {
                    // if (passage === 1)  _LOGS.result( messagesReplace(messages.infos.dbOnline, [options.database || "none"]), timeStamp());
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

export const _CONFIGURATION = new configuration(__dirname + "/config/config.json");
export const _CONFIGS = _CONFIGURATION.getConfigs();

