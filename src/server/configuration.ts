/**
 * Configuration class.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import fs from "fs";
import { API_VERSION, APP_NAME, APP_VERSION, NODE_ENV, setDebugFile } from "./constants";
import { Logs } from "./logger";
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
import { IconfigFile, IdbConnection, Iuser } from "./types";


// class to create configs environements
class Configuration {
    public list: {
        [key: string]: IconfigFile;
    } = {};
    static filePath: fs.PathOrFileDescriptor;
    static jsonConfiguration: JSON;
    static ports: number[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public postgresConnection: Knex<any, unknown[]>;
    constructor(file: fs.PathOrFileDescriptor) {   
        Configuration.filePath = file;    
        const fileTemp = fs.readFileSync(file, "utf8");    
        Configuration.jsonConfiguration = JSON.parse(fileTemp);
        const input = Configuration.jsonConfiguration.hasOwnProperty(NODE_ENV) ? Configuration.jsonConfiguration[NODE_ENV] : Configuration.jsonConfiguration;   
        Object.keys(input).forEach((element: string) => (this.list[element] = this.format(input[element], element)));
        this.postgresConnection = knex({
            client: "pg",
            connection: {
                host: this.list["admin"].pg_host,
                user: this.list["admin"].pg_user,
                password: this.list["admin"].pg_password,
                database: "postgres",
            },
            pool: { min: 0, max: 7 },
            debug: false
        });
        this.logToFile(this.list["admin"]["logFile"]);
    }

    logToFile(file: string) {        
        const active = file && file.length > 0 ? true: false;
        if (active) Logs.head("active Logs to file", file);
      
        if (active === false) return;
        setDebugFile(active);
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
            password: this.list[connectName].pg_password,
            database: this.list[connectName].pg_database,
            canPost: true,
            canDelete: true,
            canCreateUser: true,
            canCreateDb: true,
            superAdmin: false,
            admin: false
        };
         Logs.class(messages.infos.updateUser, user.username);   
        await db["admin"].table("user").count().where({username: user.username}).then(async (res: object) => {
            // recreate if exist because if you change key encrypt have to change  
            if (res[0].count == 1) {
                 Logs.head(messages.infos.updateUser, `${user.username} for ${connectName}`);
                await db["admin"].table("user").update(user).where({username: user.username});
            } else {
                 Logs.head(messages.infos.createAdminUser, `${user.username} for ${connectName}`);
                await db["admin"].table("user").insert(user);
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

    // return config(s)
    getConfigs() {
        return this.list;
    }

    isInConfig(key: string):boolean {
        return Object.keys(this.list).includes(key.trim().toLowerCase()) ;  
    }

    format(input: object, name?: string): IconfigFile {
        // If config encrypted
        Object.keys(input).forEach((elem: string) => {input[elem] = decrypt(input[elem]);});
        const returnValue = {
            name: name ? name : decrypt(input["pg_database"]) || "ERROR",
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
            lineLimit: input["lineLimit"] ? +input["lineLimit"] : 2000,
            forceHttps: input["forceHttps"] ? input["forceHttps"] : false,
            alias: input["alias"] ? String(input["alias"]).split(",") : [],
            retry: input["retry"] ? +input["retry"] : 2,
            standard: input["standard"] ? input["standard"] : false,
            logFile: input["log"] ? input["log"] : ""
        };
        if (Object.values(returnValue).includes("ERROR"))
            throw new TypeError(`${messages.errors.configFile} [${util.inspect(returnValue, { showHidden: false, depth: null })}]`);
    
        return returnValue;
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
                  Logs.result(messages.infos.dbOnline, this.list[connectName].pg_database);
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
        const timeStamp = (): string => {
            const d = new Date();
            return d.toLocaleTimeString();
        };
    
        const connect = async (): Promise<boolean> => {
                try {
                    await pool.query('SELECT 1');
                     Logs.result(messagesReplace(messages.infos.dbOnline, [options.database || "none"]), timeStamp());
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

export const CONFIGURATION = new Configuration(__dirname + "/config/config.json");
