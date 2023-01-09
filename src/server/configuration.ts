/**
 * Index config.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import fs from "fs";
import { _APIVERSION, _NODE_ENV } from "./constants";
import { message } from "./logger";
import { decrypt, hidePasswordInJson } from "./helpers";
import util from "util";
import Koa from "koa";
import { app } from ".";
import { db } from "./db";
import knex, { Knex } from "knex";
import { createDatabase } from "./db/helpers";
import pg from "pg"


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
    webSiteDoc: string;
    nb_page: number;
    lineLimit: number;
    retry: number;
    createUser?: boolean;
    forceHttps: boolean;
    alias: string[];
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


    constructor(file: fs.PathOrFileDescriptor) {
        message(true, "CLASS", this.constructor.name, "Constructor");   
        configuration.filePath = file;    
        const temp = fs.readFileSync(file, "utf8");    
        configuration.jsonConfiguration = JSON.parse(temp);
        const input = configuration.jsonConfiguration.hasOwnProperty(_NODE_ENV) ? configuration.jsonConfiguration[_NODE_ENV] : configuration.jsonConfiguration;   
        Object.keys(input).forEach((element: string) => (this.configurationList[element] = this.format(input[element], element)));
    }

    // return config(s)
    getConfigs() {
        return this.configurationList;
    }

    format(input: JSON, name?: string): IConfigFile {
        Object.keys(input).forEach((elem: string) => {input[elem] = decrypt(input[elem])});
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
            webSiteDoc: input["webSiteDoc"] || "no web site",
            nb_page: input["nb_page"] ? +input["nb_page"] : 200,
            lineLimit: input["lineLimit"] ? +input["lineLimit"] : 2000,
            seed: name === "test" ? true : input["seed"] || false,
            forceHttps: input["forceHttps"] ? input["forceHttps"] : false,
            alias: input["alias"] ? String(input["alias"]).split(",") : [],
            retry: input["retry"] ? +input["retry"] : 2
        };
        if (Object.values(returnValue).includes("ERROR"))
            throw new TypeError(`Error in config file [${util.inspect(returnValue, { showHidden: false, depth: null })}]`);
    
        return returnValue;
    };

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
          db[tempConfig.name] = this.getConnection(tempConfig.name);
          hidePasswordInJson(tempConfig);
         return tempConfig;
    };

    createKnexConnection(configName: string, database?: string): IDbConnection {
        return {
                host: this.configurationList[configName].pg_host,
                user: this.configurationList[configName].pg_user,
                password: this.configurationList[configName].pg_password,
                database: database ? database : this.configurationList[configName].pg_database,
                port: this.configurationList[configName].pg_port ? +String(this.configurationList[configName].pg_port) : -1,
                retry: this.configurationList[configName].retry ? this.configurationList[configName].retry : 2,
            }
    }
    createConnection(configName: string): IDbConnection {
        const returnValue = {
            host: this.configurationList[configName].pg_host || "ERROR",
            user: this.configurationList[configName].pg_user || "ERROR",
            password: this.configurationList[configName].pg_password || "ERROR",
            database: this.configurationList[configName].pg_database || "ERROR",
            port: this.configurationList[configName].pg_port ? +String(this.configurationList[configName].pg_port) : -1,
            retry: +String(this.configurationList[configName].retry)  || 2
    
        };
        if (Object.values(returnValue).includes("ERROR")) throw new TypeError(`Error in config file [${returnValue}]`);
        return returnValue;
    };

    getConnection(configName: string): Knex<any, unknown[]> {
        const connection: IDbConnection = this.createConnection(configName);
        return knex({
            client: "pg",
            connection: connection,
            pool: { min: 0, max: 7 },
            debug: false
        })
    };

    createConnections(): { [key: string]: Knex<any, unknown[]> } {
        const returnValue: { [key: string]: Knex<any, unknown[]> } = {};
        Object.keys(this.configurationList).forEach((key: string) => {
            const tempConnection = _CONFIGURATION.getConnection(key);
            if (tempConnection) returnValue[key] = tempConnection;
        });
        return returnValue;
    };
     
    async addToServer(app: Koa<Koa.DefaultState, Koa.DefaultContext>, key: string): Promise<boolean> {   
        await this.isDbExist(key, true)
            .then(async (res: boolean) => {                   
                  const port = _CONFIGS[key].port;
                  if (port  > 0) {
                      if (configuration.ports.includes(port)) message(false, "RESULT", `\x1b[35m[${key}]\x1b[32m add on port`, port);
                      else app.listen(port, () => {
                        configuration.ports.push(port);
                              message(false, "RESULT", `\x1b[33m[${key}]\x1b[32m listening on port`, port);
                          });
                  }
                  return res;
                  
              })
              .catch((e: any) => {
                  message(false, "ERROR", "Unable to find or create", _CONFIGS[key].pg_database);
                  console.log(e);
                  process.exit(111);
              });
              return false;
    };    

    async isDbExist(connectName: string, create: boolean): Promise<boolean> {
        const connection: IDbConnection = this.createConnection(connectName);
        message(false, "HEAD", "connectName", connectName);
    
        await this.pgwait(connection);
    
        const tempConnection = knex({
            client: "pg",
            connection: connection,
            pool: { min: 0, max: 7 },
            debug: false
        });
        
         if (!tempConnection) return false;
         return await tempConnection
             .raw("select 1+1 as result")
             .then(async () => {
                 message(false, "RESULT", "Database Online", _CONFIGS[connectName].pg_database);
                 tempConnection.destroy();
                 return true;
             })
             .catch(async (err: any) => {
                 let returnResult = false;
                 if (err.code == "3D000" && create == true) {
                     message(false, "DEBUG", "Try create DATABASE", _CONFIGS[connectName].pg_database);
                     returnResult = await createDatabase(connectName)
                         .then(async () => {
                             message(false, "INFO", "create DATABASE", "OK");
                             return true;
                         })
                         .catch((err: Error) => {
                             message(false, "ERROR", "create DATABASE", err.message);
                             return false;
                         });
                 }
                 tempConnection.destroy();
                 return returnResult;
             });
     };  
     
     async pgwait(options: IDbConnection): Promise<boolean> {
        const pool = new pg.Pool({... options, database: "postgres" });
        let passage = 1;
        const timeStamp = (): string => {
            const d = new Date()
            return d.toLocaleTimeString()
        }
        
        const printStatusMsg = (status: string): void => {
            message(false, "RESULT", `Databse PostgreSQL ${status}`, timeStamp());
        }
    
        const connect = async (): Promise<boolean> => {
                try {
                    await pool.query('SELECT 1')
                    printStatusMsg('Online')
                    await pool.end();
                    return true;
                }   
                catch (e) {
                    if (passage === 1) printStatusMsg('Offline')
                    return false;
                }
        }
        let testConnection = false;
        let end = Number(Date.now()) + options.retry  * 1000;
        do {        
            testConnection = await connect();
            passage += passage;
        } while (testConnection === false && Number(Date.now()) < end);
        return testConnection;
    }
}

export const _CONFIGURATION = new configuration(__dirname + "/config/config.json");
export const _CONFIGS = _CONFIGURATION.getConfigs();

