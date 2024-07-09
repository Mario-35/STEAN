/**
 * Configuration class
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- Configuration class -----------------------------------!");

import { addToStrings, ADMIN, APP_NAME, APP_VERSION, color, DEFAULT_DB, NODE_ENV, setReady, TEST, _DEBUG } from "../constants";
import { asyncForEach, createTunnel, decrypt, encrypt, isProduction, isTest, logToHtml, unikeList, unique, } from "../helpers";
import { IconfigFile, IdbConnection, IserviceInfos, koaContext, keyobj } from "../types";
import { errors, infos, msg } from "../messages";
import { createIndexes, createService} from "../db/helpers";
import { app } from "..";
import { EChar, EColor, EExtensions, EFileName, EOptions, EUpdate, EVersion, typeExtensions, typeOptions } from "../enums";
import fs from "fs";
import util from "util";
import update from "./update.json";
import postgres from "postgres";
import { triggers } from "../db/createDb/triggers";
import { log } from "../log";
import { createDatabase, testDatas } from "../db/createDb";
import { userAccess } from "../db/dataAccess";
import path from "path";

// class to logCreate configs environements
class Configuration {
  static configs: { [key: string]: IconfigFile } = {};
  static filePath: string;
  static port = 8029;
  static queries: { [key: string]: string[] } = {};
  public logFile = fs.createWriteStream(path.resolve(__dirname, "../", EFileName.logs), {flags : 'w'});

  constructor() {
    const file: fs.PathOrFileDescriptor = __dirname + `/${EFileName.config}`;
    Configuration.filePath = file.toString();
    // override console log important in production build will remove all console.log   
    // if(isProduction()) console.log = (data: any) => {
    //   if (data) this.writeLog(data);
    // };
    if (isTest()) {
      console.log = (data: any) => {};
      this.readConfigFile();
    } else  console.log = (data: any) => {
      if (data) this.writeLog(data);
    };
  }
  
  writeLog(input: any) {
    if (input) {
      process.stdout.write(input + "\n");
      if (serverConfig && serverConfig.logFile) serverConfig.logFile.write(logToHtml(input));
    }
  };
  
  // Read string (or default configuration file) as configuration file
  public readConfigFile(input?: string) {
    this.writeLog(`${color(EColor.Red)} ${"▬".repeat(24)} ${color( EColor.Cyan )} ${`START ${APP_NAME} version : ${APP_VERSION} [${NODE_ENV}]`} ${color( EColor.White )} ${new Date().toLocaleDateString()} : ${new Date().toLocaleTimeString()} ${color( EColor.Red )} ${"▬".repeat(24)}${color(EColor.Reset)}`);
    this.writeLog(log.message("Read config", input ? "content" : Configuration.filePath));
    try {
      // load File
      const fileContent = input || fs.readFileSync(Configuration.filePath, "utf8");
      if (fileContent.trim() === "")  {
        this.writeLog(log.error(`File is empty`, Configuration.filePath));
        process.exit(111);      
      }
      // decrypt file
      Configuration.configs = JSON.parse(decrypt(fileContent));
      if (this.validJSONConfig(Configuration.configs)) {
        if (isTest()) {
          Configuration.configs[ADMIN] = this.formatConfig(ADMIN);
          Configuration.configs[TEST] = this.formatConfig(testDatas["create"]);
        } else {
          Object.keys(Configuration.configs).forEach((element: string) => {
            Configuration.configs[element] = this.formatConfig(element);
          });
        }
      } else {
        this.writeLog(log.error(errors.configFileError));
        process.exit(112);
      }
      // rewrite file (to update config modification except in test mode)
      if (!isTest()) this.writeConfig();    
    } catch (error: any) {
      this.writeLog(log.error("Config is not correct", error["message"]));
      process.exit(111);      
    }
  }

  // verify if configuration file Exist
  public configFileExist(): boolean {
    return fs.existsSync(Configuration.filePath);
  }

  // return infos routes
  getInfos = (ctx: koaContext, name: string): IserviceInfos  => {
    const protocol:string = ctx.request.headers["x-forwarded-proto"]
      ? ctx.request.headers["x-forwarded-proto"].toString()
      : Configuration.configs[name].options.includes(EOptions.forceHttps)
        ? "https"
        : ctx.protocol;
        
    // make linkbase
    let linkBase = 
      ctx.request.headers["x-forwarded-host"]
        ? `${protocol}://${ctx.request.headers["x-forwarded-host"].toString()}`
        : ctx.request.header.host
          ? `${protocol}://${ctx.request.header.host}`
          : "";

    // make rootName
    if (!linkBase.includes(name)) linkBase +=  "/" + name;
    const version = Configuration.configs[name].apiVersion;
    return {
      protocol: protocol,
      linkBase: linkBase,
      version: version,
      root : process.env.NODE_ENV?.trim() === "test" ? `proxy/${version}` : `${linkBase}/${version}`,
      model : `https://app.diagrams.net/?lightbox=1&edit=_blank#U${linkBase}/${version}/draw`
    };
  }

  // return infos routes for all services
  public getInfosForAll(ctx: koaContext): { [key: string]: IserviceInfos } {
        const result:Record<string, any>  = {};    
    this.getConfigs().forEach((conf: string) => {
      result[conf] = this.getInfos(ctx, conf)
    });
    return result;
  }

  public isConfig(name: string) {
    return Configuration.configs.hasOwnProperty(name)
  }

  public getConfig(name: string) {
    return Configuration.configs[name];
  }

  public getConfigs() {
    return Object.keys(Configuration.configs).filter(e => e !== ADMIN);
  }

  // verify is valid config
  private validJSONConfig(input: Record<string, any> ): boolean {    
    if (!input.hasOwnProperty(ADMIN)) return false;
    if (!input[ADMIN].hasOwnProperty("pg")) return false;
    const admin = input[ADMIN]["pg" as keyobj] as JSON;
    if (!admin.hasOwnProperty("host")) return false;
    if (!admin.hasOwnProperty("user")) return false;
    if (!admin.hasOwnProperty("password")) return false;
    if (!admin.hasOwnProperty("database")) return false;
    return true;
  }

  // Write an encrypt config file in json file
  writeConfig(): boolean {
    this.writeLog(log.message("Write config", Configuration.filePath));
    const result: Record<string, any>  = {};
    Object.entries(Configuration.configs).forEach(([k, v]) => {
      if (k !== TEST) result[k] = Object.keys(v).filter(e => !e.startsWith("_")) .reduce((obj, key) => { obj[key as keyobj] = v[key as keyobj]; return obj; }, {} );
    });
    // in some case of crash config is blank so prevent to overrite it
    if (Object.keys(result).length > 0) fs.writeFile(
      // encrypt only in production mode
      Configuration.filePath,
      isProduction() === true 
        ? encrypt(JSON.stringify(result, null, 4))
        : JSON.stringify(result, null, 4),
      (err) => {
        if (err) {
          console.log(err);
          return false;
        }
      }
    );
    return true;
  }

  async executeMultipleQueries(configName: string, queries: string[], infos: string):Promise<boolean> {
    await asyncForEach( queries, async (query: string) => {
      await serverConfig
        .connection(configName)
        .unsafe(query)
        .catch((error: Error) => {
          console.log(error);
          return false;
        });
    });
    log.create(`${infos} : [${configName}]`, EChar.ok);
    return true;
  }

  async executeQueries(title: string): Promise<boolean> {
    try {
      await asyncForEach(
        Object.keys(Configuration.queries),
        async (connectName: string) => {
          await this.executeMultipleQueries(connectName, Configuration.queries[connectName], title);
        }
      );
    } catch (error) {
      console.log(error);
    }
    return true;
  }

  public hashCode(s: string): number {
    return s.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
  }
  
  // return the connection
  public connection(name: string): postgres.Sql<Record<string, unknown>> {    
    if (!Configuration.configs[name]._connection) this.createDbConnectionFromConfigName(name);
    return Configuration.configs[name]._connection || this.createDbConnection(Configuration.configs[name].pg);
  }
  
  // return postgres.js connection with ADMIN rights
  public adminConnection(): postgres.Sql<Record<string, unknown>> {
    const input = Configuration.configs[ADMIN].pg;    
    return postgres(`postgres://${input.user}:${input.password}@${input.host}:${input.port || 5432}/${DEFAULT_DB}`,
      {
        debug: _DEBUG,          
        connection: { 
          application_name : `${APP_NAME} ${APP_VERSION}`
        }
      }
    );
  }
  
  // connect ssh tunnel
  private async connectionTunnel(input: IdbConnection): Promise<boolean> {    
    if (input.tunnel) {
      this.writeLog(log.booting(`${color(EColor.Yellow)}[Tunneling to]`, input.tunnel.sshConnection.host ));
      return await createTunnel(
        { autoClose: true },
        { port: 1111 }, 
        input.tunnel.sshConnection, 
        input.tunnel.forwardConnection) .then(() => {          
          this.writeLog(log.booting(msg( infos.tunnel, `${input.tunnel?.sshConnection.host}` ), EChar.ok ));
          return true;
        }).catch((err: Error) => {
          this.writeLog(log.booting(msg( errors.tunnelError, `${input.tunnel?.sshConnection.host}` ), EChar.notOk ));
          console.log(err);        
          return false;
        });
    } else return false;
  }

  /**
   * 
   * @param input IdbConnection
   * @returns Postgres.s connection (psql connect string)
   */
  private createDbConnection(input: IdbConnection): postgres.Sql<Record<string, unknown>> {
    return postgres( 
      input.tunnel 
      ? `postgres://${input.user}:${input.password}@${input.host}:${1111}/${input.database}`
      : `postgres://${input.user}:${input.password}@${input.host}:${input.port || 5432}/${input.database}`,
      {
        debug: _DEBUG,
        max : 2000,            
        connection : { 
          application_name : `${APP_NAME} ${APP_VERSION}`
        },
      }
    );
  }
  
  public createDbConnectionFromConfigName(input: string): postgres.Sql<Record<string, unknown>> {
    const temp = this.createDbConnection(Configuration.configs[input].pg);
    Configuration.configs[input]._connection = temp;
    return temp;
  }

  addToQueries(connectName: string, query: string) {
    addToStrings(Configuration.queries[connectName], query);
  }

  private clearQueries() { 
    Configuration.queries = {}; 
  }

  async relogCreateTrigger(configName: string): Promise<boolean> {
    await asyncForEach( triggers(configName), async (query: string) => {
      const name = query.split(" */")[0].split("/*")[1].trim();
      await serverConfig.connection(configName).unsafe(query).then(() => {
        log.create(`[${configName}] ${name}`, EChar.ok);
      }).catch((error: Error) => {
        console.log(error);
        return false;
      });
    });
    return true;
  }

  // initialisation serve NOT IN TEST
  async afterAll(): Promise<boolean> {
    // Updates database after init
    if ( update && update[EUpdate.afterAll] && Object.entries(update[EUpdate.afterAll]).length > 0 ) {
      this.clearQueries();
      Object.keys(Configuration.configs)
        .filter((e) => e != ADMIN)
        .forEach(async (connectName: string) => {
          update[EUpdate.afterAll].forEach((operation: string) => { this.addToQueries(connectName, operation); });
        });
      await this.executeQueries(EUpdate.afterAll);
    }
    
    if (update && update[EUpdate.decoders] && Object.entries(update[EUpdate.decoders]).length > 0) {
      this.clearQueries();
      Object.keys(Configuration.configs)
        .filter( (e) => e != ADMIN && Configuration.configs[e].extensions.includes(EExtensions.lora) )
        .forEach((connectName: string) => {
          if(Configuration.configs[connectName].extensions.includes(EExtensions.lora)) {
            const decs:string[] = []
            Object.keys(update[EUpdate.decoders]).forEach(async (name: string) => {
              const hash = this.hashCode(update[EUpdate.decoders as keyobj][name]);
              decs.push(name);            
              const sql = `UPDATE decoder SET code='${update[EUpdate.decoders as keyobj][name]}', hash = '${hash}' WHERE name = '${name}' AND hash <> '${hash}' `;
              await serverConfig
              .connection(connectName)
              .unsafe(sql)
              .catch((error: Error) => {
                console.log(error);
                return false;
              });
            });
            this.writeLog(log.booting(`UPDATE decoder ${color(EColor.Yellow)} [${connectName}]`, decs));            
          }
        });
      }
     return true;
  }

  // initialisation serve NOT IN TEST
  async init(input?: string): Promise<boolean> {
    if (this.configFileExist()  === true || input) {
      this.readConfigFile(input);
      console.log(log.message(infos.configuration, infos.loaded + " " + EChar.ok));    
      let status = true;
      await asyncForEach(
        // Start connection ALL entries in config file
        Object.keys(Configuration.configs).filter(e => e.toUpperCase() !== TEST.toUpperCase()),
        async (key: string) => {
          try {
            if (Configuration.configs[key].pg.tunnel) {
              const test = await this.connectionTunnel(Configuration.configs[key].pg);
              if(test === true) await this.addToServer(key);
            } else await this.addToServer(key);
          } catch (error) {
            console.log(error);
            status = false;
          }
        }
      );
      this.writeLog(log._head("Ready", EChar.ok));
      setReady(status);
      if (status === true) {
        this.afterAll();
      }           
      if(!isTest()) {
        if( await this.testDbExists(TEST) ) 
          Configuration.configs[TEST] = this.formatConfig(testDatas["create"]);
          else await createService(testDatas);
          this.writeLog(log.booting(`${color(EColor.Red)}Database => Test online ${color(EColor.Green)}${infos.ListenPort}`, Configuration.port ));
      }
      this.writeLog(log.logo(APP_VERSION));
      return status;
    // no configuration file so First install    
    } else {
        console.log(log.message("file", Configuration.filePath + EChar.notOk));
          app.listen(Configuration.port, () => {
            this.writeLog(log.booting(`${color(EColor.Yellow)}[First launch]${color(EColor.Green)}${infos.ListenPort}`, Configuration.port ));
          });
        return true;
    }
  }

  // return config name from config name
  public getConfigNameFromDatabase(input: string): string | undefined {
    if (input !== "all") {
      const aliasName = Object.keys(Configuration.configs).filter( (configName: string) => Configuration.configs[configName].pg.database === input )[0];
      if (aliasName) return aliasName;
      throw new Error(`No configuration found for ${input} name`);
    }
  }

  public getConfigForExcelExport = (name: string): object=> {
    const result: Record<string, any> = Object.assign({}, Configuration.configs[name].pg);
    result["password"] = "*****";
    ["name", "apiVersion", "port", "date_format", "webSite", "nb_page", "forceHttps", "highPrecision", "canDrop", "logFile", "alias", "extensions"].forEach(e => {
      result[e]= Configuration.configs[name][e as keyobj];
    }); 
    return result;
  };
  
  public getConfigNameFromName = (name: string): string | undefined => {
    if (name) {
      if (Object.keys(Configuration.configs).includes(name)) return name;
      Object.keys(Configuration.configs).forEach((configName: string) => {
        if (Configuration.configs[configName].alias.includes(name)) return configName;
      });
    }
  };

  public getModelVersion = (name: string): EVersion => {
    switch (name) {
      case "v1.1":
      case "1.1":
        return EVersion.v1_1
      default:
        return EVersion.v1_0
    }
  }
  
  // return IconfigFile Formated for IconfigFile object or name found in json file
  private formatConfig(input: object | string, name?: string): IconfigFile {
    if (typeof input === "string") {
      name = input;
      input = Configuration.configs[input];
    }
    const options: typeof typeOptions = input["options"as keyobj]
    ? unique([... String(input["options"as keyobj]).split(",")]) as typeof typeOptions 
    : [];

    const extensions: typeof typeExtensions = input["extensions"as keyobj]
      ? unique(["base", ... String(input["extensions"as keyobj]).split(",")]) as typeof typeExtensions 
      : ["base"];
      


    if (input["extensions"as keyobj]["users"]) extensions.includes("users")
    const goodDbName = name
      ? name
      : input["pg" as keyobj] && input["pg" as keyobj]["database"] ? input["pg" as keyobj]["database"] : `ERROR` || "ERROR";
    const version = goodDbName === ADMIN ? EVersion.v1_1  : String(input["apiVersion" as keyobj]).trim();
    const returnValue: IconfigFile = {
      name: goodDbName,
      port: goodDbName === ADMIN
          ? input["port" as keyobj] || 8029
          : undefined,
      pg: {
        _ready: undefined,
        host: input["pg" as keyobj] && input["pg" as keyobj]["host" as keyobj] ? String(input["pg" as keyobj]["host" as keyobj]) : `ERROR`,
        port: input["pg" as keyobj] && input["pg" as keyobj]["port"] ? input["pg" as keyobj]["port"] : 5432,
        user: input["pg" as keyobj] && input["pg" as keyobj]["user"] ? input["pg" as keyobj]["user"] : `ERROR`,
        password: input["pg" as keyobj] && input["pg" as keyobj]["password"] ? input["pg" as keyobj]["password"] : `ERROR`,
        database: name && name === "test" ? "test" : input["pg" as keyobj] && input["pg" as keyobj]["database"] ? input["pg" as keyobj]["database"] : `ERROR`,
        retry: input["retry" as keyobj] ? +input["retry" as keyobj] : 2,
        tunnel: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] ?  {
          sshConnection: {
            host: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["sshConnection"]["host"] ? input["pg" as keyobj]["tunnel"]["sshConnection"]["host"] : `ERROR`,
            username: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["sshConnection"]["username"] ? input["pg" as keyobj]["tunnel"]["sshConnection"]["username"] : `ERROR`,
            port: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["sshConnection"]["port"] ? input["pg" as keyobj]["tunnel"]["sshConnection"]["port"] : 22,
            password: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["sshConnection"]["password"] ? input["pg" as keyobj]["tunnel"]["sshConnection"]["password"] : `ERROR`,
          },
          forwardConnection: {
            srcAddr: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["forwardConnection"]["srcAddr"] ? input["pg" as keyobj]["tunnel"]["forwardConnection"]["srcAddr"] : `ERROR`,
            srcPort: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["forwardConnection"]["srcPort"] ? input["pg" as keyobj]["tunnel"]["forwardConnection"]["srcPort"] : 22,
            dstAddr: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["forwardConnection"]["dstAddr"] ? input["pg" as keyobj]["tunnel"]["forwardConnection"]["dstAddr"] : `ERROR`,
            dstPort: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["forwardConnection"]["dstPort"] ? input["pg" as keyobj]["tunnel"]["forwardConnection"]["dstPort"] : 22
          }
        } : undefined 
      },
      apiVersion: this.getModelVersion(version),
      date_format: input["date_format" as keyobj] || "DD/MM/YYYY hh:mi:ss",
      webSite: input["webSite" as keyobj] || "no web site",
      nb_page: input["nb_page" as keyobj] ? +input["nb_page" as keyobj] : 200,
      alias: input["alias" as keyobj] ? unikeList(String(input["alias" as keyobj]).split(",")) : [],
      extensions: extensions,
      options: options,
      _connection: undefined,
    };    
    if (Object.values(returnValue).includes("ERROR"))
      throw new TypeError(
        `${errors.inConfigFile} [${util.inspect(returnValue, {
          showHidden: false,
          depth: null,
        })}]`
      );
    return returnValue;
  }

  // Add config to configuration file
  public async addConfig(addJson: object): Promise<IconfigFile | undefined> {
    try {
      const addedConfig = this.formatConfig(addJson);      
      Configuration.configs[addedConfig.name] = addedConfig;
      if(!isTest()) {
        await this.addToServer(addedConfig.name);
        this.writeConfig();
      }
      return addedConfig;
    } catch (error) {
      return undefined;
    }
  }

  // process to add an entry in server
  public async addToServer(key: string): Promise<boolean> {
    this.writeLog(log._head(key));
    return await this.isServiceExist(key, true)
      .then(async (res: boolean) => {
        if (res === true) {
          await userAccess.post(key, {
            username: Configuration.configs[key].pg.user,
            email: "steandefault@email.com",
            password: Configuration.configs[key].pg.password,
            database: Configuration.configs[key].pg.database,
            canPost: true,
            canDelete: true,
            canCreateUser: true,
            canCreateDb: true,
            superAdmin: false,
            admin: false
          });
          if(![ADMIN, TEST].includes(key)) createIndexes(key);
          this.writeLog(log.booting(`${color(EColor.Magenta)}Database => ${color(EColor.Yellow)}[${key}] ${color(EColor.Default)} on line`, res ? EChar.web : EChar.notOk));
          if(key === ADMIN) app.listen(Configuration.port, () => {
            this.writeLog(log.booting(`${color(EColor.Yellow)}[${key}] ${color(EColor.Green)}${infos.addPort}`, Configuration.port));
          });
          else this.writeLog(log.booting(`${color(EColor.Yellow)}[${key}] ${color(EColor.Green)}${infos.ListenPort}`, Configuration.port ));
        }
        return res;
      })
      .catch((error: Error) => {
        this.writeLog(log.error(errors.unableFindCreate, Configuration.configs[key].pg.database));
        console.log(error);
        process.exit(111);
      });
  }

  // test in boolean exist if not and logCreate is true then logCreate DB
  private async tryToCreateDB(connectName: string): Promise<boolean> {
    this.writeLog(log.booting("Try create Database", Configuration.configs[connectName].pg.database));
    return await createDatabase(connectName)
      .then(async () => {
        this.writeLog(log.booting(`${infos.db} ${infos.create} [${Configuration.configs[connectName].pg.database}]`, EChar.ok ));
        this.createDbConnectionFromConfigName(connectName);
        return true;
      })
      .catch((err: Error) => {;        
        this.writeLog(log.error(msg(infos.create, infos.db), err.message));
        return false;
      });
  }

  // test if database exist with admin connection
  private async testDbExists(dbName: string): Promise<boolean> {
    const input = Configuration.configs[ADMIN].pg;
    return await postgres( `postgres://${input.user}:${input.password}@${input.host}:${input.port || 5432}/${dbName}`,
      {
        debug: _DEBUG,          
        connection: { 
          application_name : `${APP_NAME} ${APP_VERSION}`
        }
      })`select 1+1 AS result`.then(async () => true)
    .catch((err: Error) => {
        console.log(err);
        return false;
      });
  }

  // verify if database exist and if create is true create database if not exist.
  private async isServiceExist(connectName: string, create: boolean): Promise<boolean> {
    this.writeLog(log.booting(infos.dbExist, Configuration.configs[connectName].pg.database));
    return await this.connection(connectName)`select 1+1 AS result`.then(async () => {
      const listTempTables = await this.connection(connectName)`SELECT array_agg(table_name) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE 'temp%';`;
      const tables = listTempTables[0]["array_agg"];
      if (tables != null)        
        this.writeLog(log.booting( `DELETE temp table(s) ==> \x1b[33m${connectName}\x1b[32m`,
          await this.connection(connectName).begin(sql => {
            tables.forEach(async (table: string) => {
              await sql.unsafe(`DROP TABLE ${table}`);
            });
          }).then(() => EChar.ok)
            .catch((err: Error) => err.message)
        ));
        if (update[EUpdate.triggers] && update[EUpdate.triggers] === true && connectName !== ADMIN) await this.relogCreateTrigger(connectName);
        if (update[EUpdate.beforeAll] && Object.entries(update[EUpdate.beforeAll]).length > 0 ) {
          if (update[EUpdate.beforeAll] && Object.entries(update[EUpdate.beforeAll]).length > 0 ) {
            console.log(log._head(EUpdate.beforeAll));
            try {              
              Object.keys(Configuration.configs)
                .filter((e) => ![ADMIN, TEST].includes(e))
                .forEach((connectName: string) => {
                  update[EUpdate.beforeAll].forEach((operation: string) => {
                    this.addToQueries(connectName, operation);
                  });
                });
              await this.executeQueries(EUpdate.beforeAll);
            // RelogCreate triggers for this service
            } catch (error) {
              console.log(error);
            }
          }
        }
        return true;
      })
      .catch(async (err: Error) => {
        // Password authentication failed 
        if (err["code" as keyobj] === "ECONNREFUSED") {
          console.log("================================");
          
        } else 
        if (err["code" as keyobj] === "28P01") {
          if (!isTest()) return await this.tryToCreateDB(connectName);
          //database does not exist
        } else if (err["code" as keyobj] === "3D000" && create == true) {
          console.log(log._infos(msg(infos.tryCreate, infos.db), Configuration.configs[connectName].pg.database ));
          if (connectName !== TEST)   return await this.tryToCreateDB(connectName);
        } else  console.log(err);
        return false;
      });
  }
}

export const serverConfig = new Configuration();