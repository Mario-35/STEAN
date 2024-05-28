/**
 * Configuration class.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- Configuration class. -----------------------------------!");
import { addToStrings, ADMIN, APP_NAME, APP_VERSION, color, DEFAULT_DB, NODE_ENV, setReady, TEST, TIMESTAMP, _DEBUG, _ERRORFILE, _NOTOK, _OK, _WEB, } from "../constants";
import { asyncForEach, decrypt, encrypt, hidePassword, isProduction, isTest, stringToBoolean, unikeList, unique, } from "../helpers";
import { IconfigFile, IdbConnection, IserviceInfos, koaContext } from "../types";
import { errors, infos, msg } from "../messages";
import { createDatabase, createService} from "../db/helpers";
import { app } from "..";
import { EnumColor, EnumExtensions, EnumOptions, EnumVersion, typeExtensions, typeOptions } from "../enums";
import fs from "fs";
import util from "util";
import update from "./update.json";
import postgres from "postgres";
import { triggers } from "../db/createDb/triggers";
import { formatLog } from "../logger";
import { log } from "../log";
import { testDatas } from "../db/createDb";
import { userAccess } from "../db/dataAccess";

// class to logCreate configs environements
class Configuration {
  static configs: { [key: string]: IconfigFile } = {};
  static filePath: string; 
  static jsonConfiguration: JSON;
  static ports: number[] = [];
  static queries: { [key: string]: string[] } = {};

  constructor(file: fs.PathOrFileDescriptor) {
    process.stdout.write(`${color(EnumColor.FgRed)} ${"=".repeat(24)} ${color( EnumColor.FgCyan )} ${`START ${APP_NAME} version : ${APP_VERSION} [${NODE_ENV}]`} ${color( EnumColor.FgWhite )} ${new Date().toLocaleDateString()} : ${new Date().toLocaleTimeString()} ${color( EnumColor.FgRed )} ${"=".repeat(24)}${color(EnumColor.Reset)}\n`);
    Configuration.filePath = file.toString();
    if (isTest()) this.readConfigFile();
  }
    
  public readConfigFile(input?: string) {
    try {
      const fileContent = input || fs.readFileSync(Configuration.filePath, "utf8");      
      Configuration.jsonConfiguration = JSON.parse(decrypt(fileContent));
      if (this.validJSONConfig(Configuration.jsonConfiguration)) {
        Object.keys(Configuration.jsonConfiguration).forEach((element: string) => {
          Configuration.configs[element] = this.formatConfig(element);
        });
        this.createConfigTest();
      }else {
        log.error(errors.configFileError);
        process.exit(112);
      }
      if (process.env.NODE_ENV?.trim() === "production" && fileContent[32] != ".") this.writeConfig();      
      // rewrite file (to update config modification)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      log.error("Config Not correct", error["message"]);
      process.exit(111);      
    }
  }

  // verify if configuration file Exist
  public configFileExist(): boolean {
    if (fs.existsSync(Configuration.filePath)) {
      return true
    } else {
      return false;
    }
  }

  private async createConfigTest() {
    // In tests there a test to create service
    if (isTest()) return;
		const result = Configuration.configs[ADMIN];
		result.name = TEST;
    result.pg.database = TEST;
    result.nb_page = 1000;
    result.extensions = ["base", "multiDatastream", "lora", "logs"];
    result.options = [EnumOptions.canDrop];
    result.connection = undefined;
    Configuration.configs[TEST] = this.formatConfig(result);
	}

  getInfos = (ctx: koaContext, name: string): IserviceInfos  => {
    console.log(Configuration.configs);
    
    const protocol:string = ctx.request.headers["x-forwarded-proto"]
          ? ctx.request.headers["x-forwarded-proto"].toString()
          : Configuration.configs[name].options.includes(EnumOptions.forceHttps)
            ? "https"
            : ctx.protocol;
        
    // make linkbase
    let linkBase = 
      ctx.request.headers["x-forwarded-host"]
        ? `${protocol}://${ctx.request.headers["x-forwarded-host"].toString()}`
        : ctx.request.header.host
          ? `${protocol}://${ctx.request.header.host}`
          : "";

    // make  rootName
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

  public getAllInfos(ctx: koaContext): { [key: string]: IserviceInfos } {
    const result = {};    
    this.getConfigs().forEach((conf: string) => {
      // @ts-ignore
      result[conf] = this.getInfos(ctx, conf)
    });
    return result;
  }

  public getConfig(name: string) {
    return Configuration.configs[name];
  }

  public getConfigs() {
    return Object.keys(Configuration.configs).filter(e => e !== ADMIN);
  }

  // verifi is valid config
  private validJSONConfig(input : JSON): boolean {    
    if (!input.hasOwnProperty(ADMIN)) return false;
    // @ts-ignore
    if (!input[ADMIN].hasOwnProperty("pg")) return false;
    // @ts-ignore
    if (!input[ADMIN][["pg"]].hasOwnProperty("host")) return false;
    // @ts-ignore
    if (!input[ADMIN][["pg"]].hasOwnProperty("user")) return false;
    // @ts-ignore
    if (!input[ADMIN][["pg"]].hasOwnProperty("password")) return false;
    // @ts-ignore
    if (!input[ADMIN][["pg"]].hasOwnProperty("database")) return false;
    return true;
  }

  // Write an encrypt config file in json file
  writeConfig(): boolean {
    const result = {};
    Object.entries(Configuration.configs).forEach(([k, v]) => {
      // @ts-ignore
      result[k] = Object.keys(v).filter(key => key !== 'db' && key[0] != "_").reduce((obj, key) => { obj[key] = v[key]; return obj; }, {} );
    });

    fs.writeFile(
      Configuration.filePath,
      isProduction() === true 
        ? encrypt(JSON.stringify(result, null, 4))
        : JSON.stringify(result, null, 4),
      (err) => {
        if (err) {
          log.error(formatLog.error(err));
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
          log.error(formatLog.error(error));
          return false;
        });
    });
    log.create(`${infos} : [${configName}]`, _OK);
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
      log.error(error);
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
    if (!Configuration.configs[name].connection) this.createDbConnectionFromConfigName(name);
    return Configuration.configs[name].connection || this.createDbConnection(Configuration.configs[name].pg);
  }
  
  // return postgres.js connection with ADMIN rights
  public connectionAdminFor(name: string): postgres.Sql<Record<string, unknown>> {
    const input = Configuration.configs[ADMIN].pg;
    return postgres(
      `postgres://${input.user}:${input.password}@${input.host}:${input.port || 5432}/${DEFAULT_DB}`,
      {
        debug: _DEBUG,          
        connection: { application_name   : `${APP_NAME} ${APP_VERSION}`, }
      }
    );
  }

  // return postgres.js connection from Connection
  private createDbConnection(input: IdbConnection): postgres.Sql<Record<string, unknown>> {
    return postgres(
      `postgres://${input.user}:${input.password}@${input.host}:${input.port || 5432}/${input.database}`, 
      {
        debug: _DEBUG,
        max : 2000,            
        connection : { application_name : `${APP_NAME} ${APP_VERSION}` },
      }
    );
  }
  
  public createDbConnectionFromConfigName(input: string): postgres.Sql<Record<string, unknown>> {
    const temp = this.createDbConnection(Configuration.configs[input].pg);
    Configuration.configs[input].connection = temp;
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
        log.create(`[${configName}] ${name}`, _OK);
      }).catch((error: Error) => {
        log.error(error);
        return false;
      });
    });
    return true;
  }

  // initialisation serve NOT IN TEST
  async afterAll(): Promise<boolean> {
    // Updates database after init
    if ( update && update["afterAll"] && Object.entries(update["afterAll"]).length > 0 ) {
      this.clearQueries();
      Object.keys(Configuration.configs)
        .filter((e) => e != ADMIN)
        .forEach(async (connectName: string) => {
          update["afterAll"].forEach((operation: string) => { this.addToQueries(connectName, operation); });
        });
      await this.executeQueries("afterAll");
    }

    if ( update && update["decoders"] && Object.entries(update["decoders"]).length > 0 ) {
      this.clearQueries();
      Object.keys(Configuration.configs)
        .filter( (e) => e != ADMIN && Configuration.configs[e].extensions.includes(EnumExtensions.lora) )
        .forEach((connectName: string) => {
          Object.keys(update["decoders"]).forEach((name: string) => {
            // @ts-ignore
            const hash = this.hashCode(update["decoders"][name]);
            // @ts-ignore
            this.addToQueries( connectName, `UPDATE decoder SET code='${update["decoders"][name]}', hash = '${hash}' WHERE name = '${name}' AND hash <> '${hash}' ` );
          });
        });
      }
     await this.executeQueries("decoders");
     return true;
  }

  // initialisation serve NOT IN TEST
  async init(): Promise<boolean> {
    if (this.configFileExist()  === true) {
      this.readConfigFile();
      console.log(log.message("configuration", "loaded " + _OK));    
      let status = true;
      const errFile = fs.createWriteStream(_ERRORFILE, { flags: "w" });
      log.booting("active error to file", _ERRORFILE) ;
      errFile.write(`## Start : ${TIMESTAMP()} \n`);
      await asyncForEach(
        // Start connection ALL entries in config file
        Object.keys(Configuration.configs).filter(e => e.toUpperCase() !== TEST),
        async (key: string) => {
          try {
            await this.addToServer(key);
          } catch (error) {
            log.error(error);
            status = false;
          }
        }
      ); 
      setReady(status);
      if (status === true) {
        this.afterAll();
      }           
      console.log(log.message(`${APP_NAME} version : ${APP_VERSION}`, `ready ${(status === true ) ? _OK : _NOTOK}`));
      return status;
    } else {
        console.log(log.message("file", Configuration.filePath + _NOTOK));
        const port = 8029;
        if (!Configuration.ports.includes(port))
          app.listen(port, () => {
            Configuration.ports.push(port);
            log.booting(`\x1b[33m[First launch]\x1b[32m ${infos.ListenPort}`, port );
          });
        return true;
        // return "http://localhost:8029/lr";
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
    const result = Object.assign({}, Configuration.configs[name].pg);
    result["password"] = "*****";
    ["name","apiVersion","port","date_format", "webSite", "nb_page", "forceHttps", "highPrecision", "canDrop", "logFile","alias", "extensions"].forEach(e => {
      // @ts-ignore
      result[e]= Configuration.configs[name][e];
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

  public getModelVersion = (name: string): EnumVersion => {
    switch (name) {
      case "v1.1":
      case "1.1":
        return EnumVersion.v1_1
      default:
        return EnumVersion.v1_0
    }
  }
  
  // return IconfigFile Formated for IconfigFile object or name found in json file
  private formatConfig(input: object | string, name?: string): IconfigFile {   
    if (typeof input === "string") {
      name = input;
      input = Configuration.jsonConfiguration[input];
    }    
    const options: typeof typeOptions = input["options"]
    ? unique([... String(input["options"]).split(",")]) as typeof typeOptions 
    : [];

    const extensions: typeof typeExtensions = input["extensions"]
      ? unique(["base", ... String(input["extensions"]).split(",")]) as typeof typeExtensions 
      : ["base"];

    // TO REMOVE AFTER ALL SERVICES CLEAN
    const formatOldConfig = () => {
      if (stringToBoolean(input["stripNull"])) {
        options.push(EnumOptions.stripNull)
        delete input["stripNull"]
      }
      if (stringToBoolean(input["canDrop"])) {
        options.push(EnumOptions.canDrop)
        delete input["canDrop"]
      }
      if (stringToBoolean(input["forceHttps"])) {
        options.push(EnumOptions.forceHttps)
        delete input["forceHttps"]
      }
    }

    formatOldConfig();
    const goodDbName = name
      ? name
      // @ts-ignore
      : input[`pg`] && input[`pg`]["database"] ? input[`pg`]["database"] : `ERROR` || "ERROR";
    const version = goodDbName === ADMIN ? EnumVersion.v1_1  : String(input["apiVersion"]).trim();
    const returnValue: IconfigFile = {
      name: goodDbName,
      port: goodDbName === ADMIN
        // @ts-ignore
          ? input["port"] || 8029
          // @ts-ignore
          : input["port"] || Configuration.configs[ADMIN].port || 8029,
      pg: {
        // @ts-ignore
        host: input[`pg`] && input[`pg`]["host"] ? input[`pg`]["host"] : `ERROR`,
        // @ts-ignore
        port: input[`pg`] && input[`pg`]["port"] ? input[`pg`]["port"] : 5432,
        // @ts-ignore
        user: input[`pg`] && input[`pg`]["user"] ? input[`pg`]["user"] : `ERROR`,
        // @ts-ignore
        password: input[`pg`] && input[`pg`]["password"] ? input[`pg`]["password"] : `ERROR`,
        // @ts-ignore
        database: name && name === "test" ? "test" : input[`pg`] && input[`pg`]["database"] ? input[`pg`]["database"] : `ERROR`,
        // @ts-ignore
        retry: input["retry"] ? +input["retry"] : 2,
      },
      apiVersion: this.getModelVersion(version),
      // @ts-ignore
      date_format: input["date_format"] || "DD/MM/YYYY hh:mi:ss",
      // @ts-ignore
      webSite: input["webSite"] || "no web site",
      // @ts-ignore
      nb_page: input["nb_page"] ? +input["nb_page"] : 200,
      // @ts-ignore
      alias: input["alias"] ? unikeList(String(input["alias"]).split(",")) : [],
      extensions: extensions,
      options: options,
      connection: undefined,
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
      // @ts-ignore
      Configuration.jsonConfiguration[addedConfig.name] = addedConfig;
      fs.writeFile(
        Configuration.filePath,
        encrypt(JSON.stringify(Configuration.jsonConfiguration, null, 4)),
        (err) => {
          if (err) {
            log.error(formatLog.error(err));
            return false;
          }
        }
      );
      Configuration.configs[addedConfig.name] = this.formatConfig(addedConfig);
      await this.addToServer(addedConfig.name);
      this.writeConfig();
      hidePassword(addedConfig);
      return addedConfig;
    } catch (error) {
      return undefined;
    }
  }

  // process to add an entry in server
  public async addToServer(key: string): Promise<boolean> {
    await this.isDbExist(key, true)
      .then(async (res: boolean) => {
          await userAccess.post(key, {
            username: Configuration.configs[key].pg.user,
            email: "default@email.com",
            password: Configuration.configs[key].pg.password,
            database: Configuration.configs[key].pg.database,
            canPost: true,
            canDelete: true,
            canCreateUser: true,
            canCreateDb: true,
            superAdmin: false,
            admin: false
          });
        log.booting(`\x1b[37mDatabase => ${key}\x1b[39m on line`, res ? _WEB : _NOTOK);
        const port = Configuration.configs[key].port;
        if (port > 0) {
          if (Configuration.ports.includes(port))
            log.booting(`\x1b[35m[${key}]\x1b[32m ${infos.addPort}`, port );
          else
            app.listen(port, () => {
              Configuration.ports.push(port);
              log.booting(`\x1b[33m[${key}]\x1b[32m ${infos.ListenPort}`, port );
            });
        }
        return res;
      })
      .catch((error: Error) => {
        log.error(errors.unableFindCreate, Configuration.configs[key].pg.database);
        log.error(error);
        process.exit(111);
      });
    return false;
  }

  // test in boolean exist if not and logCreate is true then logCreate DB
  private async tryToCreateDB(connectName: string): Promise<boolean> {
    log.booting("Try create Database", Configuration.configs[connectName].pg.database);
    return await createDatabase(connectName)
      .then(async () => {
        log.booting(`${infos.db} ${infos.create} [${Configuration.configs[connectName].pg.database}]`, _OK );
        this.createDbConnectionFromConfigName(connectName);
        return true;
      })
      .catch((err: Error) => {;        
        log.error(msg(infos.create, infos.db), err.message);
        return false;
      });
  }

  private async isDbExist(connectName: string, logCreate: boolean): Promise<boolean> {
    log.booting(infos.dbExist, Configuration.configs[connectName].pg.database);
    return await this.connection(connectName)`select 1+1 AS result`
      .then(async () => {
        const listTempTables = await this.connection(connectName)`SELECT array_agg(table_name) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE 'temp%';`;
        const tables = listTempTables[0]["array_agg"];
        if (tables != null)        
          log.booting(
            `delete temp tables ==> \x1b[33m${connectName}\x1b[32m`,
            await this.connection(connectName).begin(sql => {
              tables.forEach(async (table: string) => {await sql.unsafe(`DROP TABLE ${table}`);});
            }).then(() => _OK)
              .catch((err: Error) => err.message)
          );
        if (update["triggers"] && update["triggers"] === true && connectName !== ADMIN) await this.relogCreateTrigger(connectName);
        if ( update && update["beforeAll"] && Object.entries(update["beforeAll"]).length > 0 ) {
          if ( update && update["beforeAll"] && Object.entries(update["beforeAll"]).length > 0 ) {
            console.log(formatLog.head("beforeAll"));
            try {              
              Object.keys(Configuration.configs)
                .filter((e) => e != ADMIN)
                .forEach((connectName: string) => {
                  update["beforeAll"].forEach((operation: string) => {
                    this.addToQueries(connectName, operation);
                  });
                });
              await this.executeQueries("beforeAll");
            // RelogCreate triggers for this service
            } catch (error) {
              log.error(formatLog.error(error));
            }
          }
        }
        return true;
      })
      .catch(async (err: Error) => {
        let returnResult = false;
        // Password authentication failed 
        // @ts-ignore
        if (err["code"] === "28P01") {
          returnResult = await this.tryToCreateDB(connectName);
          if (returnResult === false) log.error(formatLog.error(err));
          //database does not exist
          // @ts-ignore
        } else if (err["code"] === "3D000" && logCreate == true) {
          console.log(formatLog.debug( msg(infos.tryCreate, infos.db), Configuration.configs[connectName].pg.database ));
          // If not in tdd tests create test DB for documentation
          if (!isTest() && connectName === TEST) {
            await createService(testDatas);
          } else returnResult = await this.tryToCreateDB(connectName);
        } else log.error(formatLog.error(err));
        return returnResult;
      });
  }
}

export const serverConfig = new Configuration(__dirname + `/${NODE_ENV}.json`);