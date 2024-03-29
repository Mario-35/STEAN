/**
 * Configuration class.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
import { ADMIN, APP_NAME, APP_VERSION, color, DEFAULT_DB, NODE_ENV, setReady, TEST, TIMESTAMP, _DEBUG, _ERRORFILE, _NOTOK, _OK, _WEB, } from "../constants";
import { addSimpleQuotes, asyncForEach, decrypt, encrypt, hidePassword, isProduction, isTest, unikeList, } from "../helpers";
import { IconfigFile, IdbConnection, IserviceLink } from "../types";
import { errors, infos, msg } from "../messages";
import { createDatabase, createService, executeSql} from "../db/helpers";
import { app } from "..";
import { EColor, EextensionsType, EmodelType } from "../enums";
import fs from "fs";
import util from "util";
import update from "./update.json";
import postgres from "postgres";
import { triggers } from "../db/createDb/triggers";
import { formatLog } from "../logger";
import { log } from "../log";
import koa from "koa";
import { testDatas } from "../db/createDb";
import { userAccess } from "../db/dataAccess";

// class to logCreate configs environements
class Configuration {
  static configs: { [key: string]: IconfigFile } = {};
  static filePath: fs.PathOrFileDescriptor;  
  static jsonConfiguration: JSON;
  static ports: number[] = [];
  static queries: { [key: string]: string[] } = {};

  constructor(file: fs.PathOrFileDescriptor) {
    try {
      process.stdout.write(`${color(EColor.FgRed)} ${"=".repeat(24)} ${color( EColor.FgCyan )} ${`START ${APP_NAME} version : ${APP_VERSION} [${NODE_ENV}]`} ${color( EColor.FgWhite )} ${new Date().toLocaleDateString()} : ${new Date().toLocaleTimeString()} ${color( EColor.FgRed )} ${"=".repeat(24)}${color(EColor.Reset)}\n`);
      Configuration.filePath = file;
      const fileContent = fs.readFileSync(file, "utf8");
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
      console.log(error);
      log.error("Config Not correct", error["message"]);
      process.exit(111);      
    }
  }
  private async createConfigTest() {
  if (isTest()) return;
		const result = Configuration.configs[ADMIN];
		result.name = TEST;
    result.pg.database = TEST;
    result.nb_page = 1000;
    result.extensions = ["base", "multiDatastream", "lora", "logs"];
    result.canDrop = true;
    result.logFile = "";
    result.connection = undefined;
    Configuration.configs[TEST] = this.formatConfig(result);
	}

  getLinkBase = (ctx: koa.Context, name: string): IserviceLink  => {
    const protocol:string = ctx.request.headers["x-forwarded-proto"]
          ? ctx.request.headers["x-forwarded-proto"].toString()
          : Configuration.configs[name].forceHttps && Configuration.configs[name].forceHttps === true
            ? "https"
            : ctx.protocol;
        // make linkbase
    let linkBase = ctx.request.headers["x-forwarded-host"]
        ? `${protocol}://${ctx.request.headers["x-forwarded-host"].toString()}`
        : ctx.request.header.host
        ? `${protocol}://${ctx.request.header.host}`
        : "";
      // make  rootName
      if (!linkBase.includes(name)) linkBase +=  "/" + name;
      const version = Configuration.configs[name].apiVersion
      return {
        protocol: protocol,
        linkBase: linkBase,
        version: version,
        root : process.env.NODE_ENV?.trim() === "test"
          ? `proxy/${version}`
          : `${linkBase}/${version}`,
        model : `https://app.diagrams.net/?lightbox=1&edit=_blank#U${linkBase}/${version}/draw`
      };
  }

  public getAllInfos(ctx: koa.Context): { [key: string]: IserviceLink } {
    const result = {};    
    this.getConfigs().forEach((conf: string) => {
      result[conf] =  this.getLinkBase(ctx, conf)
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
    if (!input.hasOwnProperty("admin")) return false;
    if (!input["admin"].hasOwnProperty("pg")) return false;
    if (!input["admin"][["pg"]].hasOwnProperty("host")) return false;
    if (!input["admin"][["pg"]].hasOwnProperty("user")) return false;
    if (!input["admin"][["pg"]].hasOwnProperty("password")) return false;
    if (!input["admin"][["pg"]].hasOwnProperty("database")) return false;
    return true;
  }

  // Write an encrypt config file in json file
  private writeConfig(): boolean {    
    const result = {};
    Object.entries(Configuration.configs).forEach(([k, v]) => {        
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
      });
      return true;
  }

  async executeMultipleQueries(configName: string, queries: string[], infos: string):Promise<boolean> {
    await asyncForEach( queries, async (query: string) => {
      await serverConfig.connection(configName).unsafe(query)
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
  
  public connectionAdminFor(name: string): postgres.Sql<Record<string, unknown>> {
    const input = Configuration.configs[ADMIN].pg;
    return postgres(`postgres://${input.user}:${input.password}@${input.host}:${input.port || 5432}/${DEFAULT_DB}`,
    {
      debug: _DEBUG,          
      connection           : {
        application_name   : `${APP_NAME} ${APP_VERSION}`,
      }
    }
    );
  }

  // return postgres.js connection from Connection
  private createDbConnection(input: IdbConnection): postgres.Sql<Record<string, unknown>> {
    return postgres(`postgres://${input.user}:${input.password}@${input.host}:${input.port || 5432}/${input.database}`, {
      debug: _DEBUG,
      max : 2000,            
      connection : { application_name : `${APP_NAME} ${APP_VERSION}` },
    });
  }
  
  public createDbConnectionFromConfigName(input: string): postgres.Sql<Record<string, unknown>> {
    const temp = this.createDbConnection(Configuration.configs[input].pg);
    Configuration.configs[input].connection = temp;
    return temp;
  }

  async addToQueries(connectName: string, query: string) {
    if (Configuration.queries[connectName]) 
      Configuration.queries[connectName].push(query);
    else Configuration.queries[connectName] = [query];
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
        .filter((e) => e != "admin")
        .forEach(async (connectName: string) => {
          update["afterAll"].forEach((operation: string) => { this.addToQueries(connectName, operation); });
        });
      await this.executeQueries("afterAll");
    }

    if ( update && update["decoders"] && Object.entries(update["decoders"]).length > 0 ) {
      this.clearQueries();
      Object.keys(Configuration.configs)
        .filter( (e) => e != "admin" && Configuration.configs[e].extensions.includes(EextensionsType.lora) )
        .forEach((connectName: string) => {
          Object.keys(update["decoders"]).forEach((name: string) => {
            const hash = this.hashCode(update["decoders"][name]);
            this.addToQueries( connectName, `update decoder set code='${update["decoders"][name]}', hash = '${hash}' WHERE name = '${name}' and hash <> '${hash}' ` );
          });
        });
      }
     await this.executeQueries("decoders");
     return true;
  }

  // initialisation serve NOT IN TEST
  async init(): Promise<boolean> {
    console.log(log.message("configuration", "loaded " + _OK));    
    let status = true;
    const errFile = fs.createWriteStream(_ERRORFILE, { flags: "w" });
    log.booting("active error to file", _ERRORFILE) ;
    errFile.write(`## Start : ${TIMESTAMP()} \n`);
    await asyncForEach(
      // Start connectionsening ALL entries in config file
      Object.keys(Configuration.configs).filter(e => e.toUpperCase() !== TEST),
      async (key: string) => {
        // await Configuration.configs[ADMIN].connection?.unsafe ( `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname = '${key}'`);
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
      this.saveConfig();
    }           
    console.log(log.message(`${APP_NAME} version : ${APP_VERSION}`, `ready ${(status === true ) ? _OK : _NOTOK}`));    

    return status;
  }
  
  private async saveConfig():Promise<boolean> {
    const temp = encrypt(JSON.stringify(Configuration.configs, null, 4));
    return await executeSql(serverConfig.getConfig(ADMIN), `INSERT INTO "public"."configs" ("key", "config")  VALUES(${addSimpleQuotes(temp.substring(32, 0))} ,${addSimpleQuotes(temp.slice(33))});`)
      .then(() => true)
      .catch(() => false);
  }

  // return config name from config name
  public getConfigNameFromDatabase(input: string): string | undefined {
    if (input === "all") return;
    const aliasName = Object.keys(Configuration.configs).filter( (configName: string) => Configuration.configs[configName].pg.database === input )[0];
    if (aliasName) return aliasName;
    throw new Error(`No configuration found for ${input} name`);
  }

  public getConfigForExcelExport = (name: string): object=> {
    const result = Object.assign({}, Configuration.configs[name].pg);
    result["password"] = "*****";
    ["name","apiVersion","port","date_format", "webSite", "nb_page", "forceHttps", "highPrecision", "canDrop", "logFile","alias", "extensions"].forEach(e => {
      result[e]= Configuration.configs[name][e];
    }); 
    return result;
  };
  
  public getConfigNameFromName = (name: string): string | undefined => {
    if (name) {
      const databaseName = Object.keys(Configuration.configs).includes(name) ? name : undefined;
      if (databaseName) return databaseName;
      let aliasName: undefined | string = undefined;
      Object.keys(Configuration.configs).forEach((configName: string) => {
        if (Configuration.configs[configName].alias.includes(name)) aliasName = configName; });
      if (aliasName) return aliasName;
    }
  };

  public getModelVersion = (name: string): EmodelType => {
    switch (name) {
      case "v1.1":
      case "1.1":
        return EmodelType.v1_1
      default:
        return EmodelType.v1_0
    }
  }

  // return IconfigFile Formated for IconfigFile object or name found in json file
  private formatConfig(input: object | string, name?: string): IconfigFile {
    if (typeof input === "string") {
      name = input;
      input = Configuration.jsonConfiguration[input];
    }
    const goodDbName = name
      ? name
      : input[`pg`] && input[`pg`]["database"] ? input[`pg`]["database"] : `ERROR` || "ERROR";        
    let extensions = input["extensions"]
      ? ["base", ... String(input["extensions"]).split(",")]
      : ["base"];
    extensions = unikeList(extensions);
    const version = goodDbName === "admin" ? EmodelType.v1_1  : String(input["apiVersion"]).trim();
    const returnValue: IconfigFile = {
      name: goodDbName,
      port:
        goodDbName === "admin"
          ? input["port"] || 8029
          : input["port"] || Configuration.configs[ADMIN].port || 8029,
      pg: {
        host: input[`pg`] && input[`pg`]["host"] ? input[`pg`]["host"] : `ERROR`,
        port: input[`pg`] && input[`pg`]["port"] ? input[`pg`]["port"] : 5432,
        user: input[`pg`] && input[`pg`]["user"] ? input[`pg`]["user"] : `ERROR`,
        password: input[`pg`] && input[`pg`]["password"] ? input[`pg`]["password"] : `ERROR`,
        database: name && name === "test" ? "test" : input[`pg`] && input[`pg`]["database"] ? input[`pg`]["database"] : `ERROR`,
        retry: input["retry"] ? +input["retry"] : 2,
      },
      apiVersion: this.getModelVersion(version),
      date_format: input["date_format"] || "DD/MM/YYYY hh:mi:ss",
      webSite: input["webSite"] || "no web site",
      nb_page: input["nb_page"] ? +input["nb_page"] : 200,
      forceHttps: input["forceHttps"] ? input["forceHttps"] : false,
      stripNull: input["stripNull"] ? input["stripNull"] : false,
      alias: input["alias"] ? unikeList(String(input["alias"]).split(",")) : [],
      extensions: extensions,
      highPrecision: input["highPrecision"] ? input["highPrecision"] : false,
      canDrop: input["canDrop"] ? input["canDrop"] : false,
      logFile: input["log"] ? input["log"] : "",
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

  public async addConfig(addJson: object): Promise<IconfigFile | undefined> {
    try {
      const addedConfig = this.formatConfig(addJson);
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
        if (update["triggers"] && update["triggers"] === true && connectName !== "admin") await this.relogCreateTrigger(connectName);
        if ( update && update["beforeAll"] && Object.entries(update["beforeAll"]).length > 0 ) {
          if ( update && update["beforeAll"] && Object.entries(update["beforeAll"]).length > 0 ) {
            console.log(formatLog.head("beforeAll"));
            try {              
              Object.keys(Configuration.configs)
                .filter((e) => e != "admin")
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
        if (err["code"] === "28P01") {
          returnResult = await this.tryToCreateDB(connectName);
          if (returnResult === false) log.error(formatLog.error(err));
        } else if (err["code"] === "3D000" && logCreate == true) {
          console.log(formatLog.debug( msg(infos.tryCreate, infos.db), Configuration.configs[connectName].pg.database ));
          if (!isTest() && connectName === TEST) {
            await createService(testDatas);
          } else returnResult = await this.tryToCreateDB(connectName);
        } else log.error(formatLog.error(err));
        return returnResult;
      });
  }
}
export const serverConfig = new Configuration(__dirname + `/${NODE_ENV}.json`);
