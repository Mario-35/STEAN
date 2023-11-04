/**
 * Configuration class.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
import fs from "fs";
import {
  ADMIN,
  API_VERSION,
  APP_NAME,
  APP_VERSION,
  DEFAULT_DB,
  NODE_ENV,
  setDebug,
  setReady,
  TIMESTAMP,
  _DEBUG,
} from "../constants";
import { Logs } from "../logger";
import {
  asyncForEach,
  decrypt,
  encrypt,
  hidePasswordIn,
  isTest,
  unikeList,
} from "../helpers";
import util from "util";
import { app } from "..";
import knex, { Knex } from "knex";
import { createDatabase } from "../db/helpers";
import pg from "pg";
import update from "./update.json";
import { errors, infos, msg } from "../messages";
import { IconfigFile, IdbConnection, Iuser } from "../types";
import { _DB } from "../db/constants";
import { EextensionsType } from "../enums";

// class to create configs environements
class Configuration {
  public configs: { [key: string]: IconfigFile } = {};
  static filePath: fs.PathOrFileDescriptor;
  static jsonConfiguration: JSON;
  static ports: number[] = [];
  static queries: { [key: string]: string[] } = {};

  constructor(file: fs.PathOrFileDescriptor) {
    Logs.start(`START ${APP_NAME} version : ${APP_VERSION} [${NODE_ENV}]`);
    Configuration.filePath = file;
    const fileTemp = fs.readFileSync(file, "utf8");
    Configuration.jsonConfiguration = JSON.parse(fileTemp);
    Object.keys(Configuration.jsonConfiguration).forEach((element: string) => {
      this.configs[element] = this.formatConfig(element);
    });
  }

  hashCode(s: string): number {
    return s.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
  }
  
  // return the connection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db(name: string): Knex<any, unknown[]> {
    if (!this.configs[name].db) this.createDbConnectionFromConfigName(name);
    return (
      this.configs[name].db || this.createDbConnection(this.configs[name].pg)
    );
  }

  dbAdminFor(name: string): Knex<any, unknown[]> {
    return knex({
      client: "pg",
      connection: {
        ...this.configs[name].pg,
        database: DEFAULT_DB,
        application_name: `${APP_NAME} ${APP_VERSION}`,
      },
      pool: { min: 0, max: 7 },
      debug: false,
    });
  }

  // return knex connection from Connection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private createDbConnection(input: IdbConnection): Knex<any, unknown[]> {
    return knex({
      client: "pg",
      connection: {
        ...input,
        application_name: `${APP_NAME} ${APP_VERSION}`,
      },
      pool: { min: 0, max: 7 },

      debug: false,
    });
  }

  // create, affect and return kenx connection from and in config by is name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createDbConnectionFromConfigName(input: string): Knex<any, unknown[]> {
    const temp = this.createDbConnection(this.configs[input].pg);
    this.configs[input].db = temp;
    return temp;
  }

  async addToQueries(connectName: string, query: string) {
    if (Configuration.queries[connectName])
      Configuration.queries[connectName].push(query);
    else Configuration.queries[connectName] = [query];
  }

  clearQueries() {
    Configuration.queries = {};
  }

  async executeQueries(title: string, boot?: boolean): Promise<void> {
    try {
      await asyncForEach(
        Object.keys(Configuration.queries),
        async (connectName: string) => {
          await this.db(connectName)
            .raw(Configuration.queries[connectName].join(";"))
            .then(() => {
              Configuration.queries[connectName] = [];
              boot && boot === true
                ? Logs.booting(connectName, "✔")
                : Logs.debug(connectName, "✔");
            })
            .catch((err: Error) => Logs.error(err.message));
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  // initialisation serve NOT IN TEST
  async afterAll(): Promise<void> {
    // Updates database after init
    if (
      update &&
      update["afterAll"] &&
      Object.entries(update["afterAll"]).length > 0
    ) {
      Logs.head("afterAll");
      this.clearQueries();
      try {
        Object.keys(this.configs)
          .filter((e) => e != "admin")
          .forEach((connectName: string) => {
            update["afterAll"].forEach((operation: string) => {
              this.addToQueries(connectName, operation);
            });
          });
        await this.executeQueries("afterAll", true);
      } catch (error) {
        console.log(error);
      }
    }

    if (
      update &&
      update["decoders"] &&
      Object.entries(update["decoders"]).length > 0
    ) {
      Logs.head("decoders");
      this.clearQueries();
      Object.keys(this.configs)
        .filter(
          (e) =>
            e != "admin" &&
            this.configs[e].extensions.includes(EextensionsType.lora)
        )
        .forEach((connectName: string) => {
          Object.keys(update["decoders"]).forEach((name: string) => {
            const hash = this.hashCode(update["decoders"][name]);
            this.addToQueries(
              connectName,
              `update decoder set code='${update["decoders"][name]}', hash = '${hash}' where name = '${name}' and hash <> '${hash}' `
            );
          });
        });
      await this.executeQueries("decoders", true);
    }
  }

  // initialisation serve NOT IN TEST
  async init(): Promise<void> {
    let status = true;
    this.logToFile(this.configs[ADMIN]["logFile"]);
    Logs.booting("active error to file", "errorFile.md");
    const errFile = fs.createWriteStream("errorFile.md", { flags: "w" });
    errFile.write(`## Start : ${TIMESTAMP()} \n`);

    await asyncForEach(
      // Start connectionsening ALL entries in config file
      Object.keys(this.configs),
      async (key: string) => {
        try {
          await this.addToServer(key);
        } catch (error) {
          console.log(error);
          status = false;
        }
      }
    );
    setReady(status);
    this.afterAll();
  }

  // Create logs in file
  private logToFile(file: string) {
    setDebug(file && file.length > 0 ? true : false);
    if (_DEBUG === false) return;
    Logs.head("active Logs to file", file);

    // Or 'w' to truncate the file every time the process starts.
    const logFile = fs.createWriteStream(file, { flags: "a" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log = (...data: any[]) => {
      logFile.write(
        util.format.apply(null, data).replace(/\u001b[^m]*?m/g, "") + "\n"
      );
      if (!isTest()) process.stdout.write(util.format.apply(null, data) + "\n");
    };
    console.error = console.log;
  }

  // create user in admin DB
  private async createUser(connectName: string) {
    const user: Iuser = {
      username: this.configs[connectName].pg.user,
      email: "default@email.com",
      password: encrypt(this.configs[connectName].pg.password),
      database: "all",
      // database: this.configs[connectName].pg.database,
      canPost: true,
      canDelete: true,
      canCreateUser: true,
      canCreateDb: true,
      superAdmin: false,
      admin: true,
    };
    await this.db(ADMIN)
      .table("user")
      .count()
      .where({ username: user.username })
      .then(async (res: object) => {
        // recreate if exist because if you change key encrypt have to change
        if (res[0].count == 1) {
          Logs.booting(infos.updateUser, `${user.username} for ${connectName}`);
          await this.db(ADMIN)
            .table("user")
            .update(user)
            .where({ username: user.username });
        } else {
          Logs.booting(
            infos.createAdminUser,
            `${user.username} for ${connectName}`
          );
          await this.db(ADMIN).table("user").insert(user);
        }
      })
      .catch((err: Error) => {
        Logs.error(err);
      });
  }

  // return config name from config name
  getConfigNameFromDatabase(input: string): string | undefined {
    if (input === "all") return;
    const aliasName = Object.keys(this.configs).filter(
      (configName: string) => this.configs[configName].pg.database === input
    )[0];
    if (aliasName) return aliasName;
    throw new Error(`No configuration found for ${input} name`);
  }

  getConfigExport= (name: string): object=> {
    const result = Object.assign({}, this.configs[name].pg);
    result["password"] = "*****";
    ["name","apiVersion","port","date_format", "webSite", "nb_page", "forceHttps", "highPrecision", "logFile","alias", "extensions"].forEach(e => {
      result[e]= this.configs[name][e];
    }); 
    return result;
  };

  getConfigNameFromName = (name: string): string | undefined => {
    if (name) {
      const databaseName = isTest()
        ? "test"
        : Object.keys(this.configs).includes(name)
        ? name
        : undefined;
      if (databaseName) return databaseName;
      let aliasName: undefined | string = undefined;
      Object.keys(this.configs).forEach((configName: string) => {
        if (this.configs[configName].alias.includes(name))
          aliasName = configName;
      });
      if (aliasName) return aliasName;
    }
  };

  // return IconfigFile Formated for IconfigFile object or name found in json file
  private formatConfig(input: object | string, name?: string): IconfigFile {
    if (typeof input === "string") {
      name = input;
      input = Configuration.jsonConfiguration[input];
    }
    // If config encrypted
    Object.keys(input).forEach((elem: string) => {
      input[elem] = decrypt(input[elem]);
    });
    const goodDbName = name
      ? name
      : decrypt(
          input["pg_database"]
            ? input["pg_database"]
            : input["pg"]
            ? input["pg"]["database"]
            : "ERROR"
        ) || "ERROR";
    let extensions = input["extensions"]
      ? String(input["extensions"]).split(",")
      : [];
    if (input["multiDatastream"] && input["multiDatastream"] === true)
      extensions.push("multiDatastream");
    if (input["lora"] && input["lora"] === true)
      extensions.push("multiDatastream", "lora");
    if (input["numeric"] && input["numeric"] === true) extensions = ["numeric"];
    extensions = unikeList(extensions);
    const returnValue: IconfigFile = {
      name: goodDbName,
      port:
        goodDbName === "admin"
          ? input["port"] || 8029
          : input["port"] || this.configs[ADMIN].port || 8029,
      pg: {
        host: input["pg_host"] || input["pg"]["host"] || "ERROR",
        port: input["pg_port"]
          ? +input["pg_port"]
          : input["pg"] && input["pg"]["port"]
          ? +input["pg"]["port"]
          : 5432,
        user: input["pg_user"] || input["pg"]["user"] || "ERROR",
        password: input["pg_password"] || input["pg"]["password"] || "ERROR",
        database:
          name && name === "test"
            ? "test"
            : input["pg_database"] || input["pg"]["database"] || "ERROR",
        retry: input["retry"] ? +input["retry"] : 2,
      },
      apiVersion: input["apiVersion"] || API_VERSION,
      date_format: input["date_format"] || "DD/MM/YYYY hh:mi:ss",
      webSite: input["webSite"] || "no web site",
      nb_page: input["nb_page"] ? +input["nb_page"] : 200,
      forceHttps: input["forceHttps"] ? input["forceHttps"] : false,
      alias: input["alias"] ? unikeList(String(input["alias"]).split(",")) : [],
      extensions: extensions,
      highPrecision: input["highPrecision"] ? input["highPrecision"] : false,
      logFile: input["log"] ? input["log"] : "",
      entities: Object.keys(_DB).filter((e) =>
        [
          goodDbName === "admin" ? EextensionsType.admin : EextensionsType.base,
          EextensionsType.logger,
          ...extensions,
        ].some((r) => _DB[e].essai.includes(r))
      ),
      db: undefined,
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

  // Add a new config file in json file
  async addConfig(addJson: object): Promise<IconfigFile> {
    const configs = this.formatConfig(addJson);
    Configuration.jsonConfiguration[configs.name] = configs;
    fs.writeFile(
      Configuration.filePath,
      JSON.stringify(Configuration.jsonConfiguration, null, 4),
      (err) => {
        if (err) {
          console.error(err);
          return false;
        }
      }
    );
    await this.addToServer(configs.name);
    hidePasswordIn(configs);
    return configs;
  }

  // process to add an entry in server
  async addToServer(key: string): Promise<boolean> {
    await this.isDbExist(key, true)
      .then(async (res: boolean) => {
        await serverConfig.createUser(key);
        Logs.bootingResult(`\x1b[37mDatabase => ${key}\x1b[39m on line`, res);
        const port = this.configs[key].port;
        if (port > 0) {
          if (Configuration.ports.includes(port))
            Logs.bootingResult(
              `\x1b[35m[${key}]\x1b[32m ${infos.addPort}`,
              port
            );
          else
            app.listen(port, () => {
              Configuration.ports.push(port);
              Logs.bootingResult(
                `\x1b[33m[${key}]\x1b[32m ${infos.ListenPort}`,
                port
              );
            });
        }
        return res;
      })
      .catch((error: Error) => {
        Logs.error(errors.unableFindCreate, this.configs[key].pg.database);
        console.log(error);
        process.exit(111);
      });
    return false;
  }

  // Wait postgres connection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async waitConnection(
    configName: string
  ): Promise<Knex<any, unknown[]> | undefined> {
    const connection = this.configs[configName].pg;
    return await this.pgwait(connection).then(async (test) => {
      if (test === true) {
        return this.configs[configName]
          ? await this.db(configName)
              .raw("select 1+1 AS result")
              .then(() => this.configs[configName].db)
              .catch(() => undefined)
          : undefined;
      }
    });
  }

  // test in boolean exist if not and create is true then create DB
  private async tryToCreateDB(connectName: string): Promise<boolean> {
    return await createDatabase(connectName)
      .then(async () => {
        Logs.bootingResult(
          `${infos.db} ${infos.create} [${this.configs[connectName].pg.database}]`,
          "OK"
        );
        this.createDbConnectionFromConfigName(connectName);
        return true;
      })
      .catch((err: Error) => {
        Logs.error(msg(infos.create, infos.db), err.message);
        return false;
      });
  }

  private async isDbExist(
    connectName: string,
    create: boolean
  ): Promise<boolean> {
    Logs.booting(infos.dbExist, this.configs[connectName].pg.database);
    return await this.db(connectName)
      .raw("select 1+1 AS result")
      .then(async () => {
        const listTempTables = await this.db(connectName).raw(
          "SELECT array_agg(table_name) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE 'temp%';"
        );
        const tables = listTempTables.rows[0].array_agg;
        if (tables)
          Logs.bootingResult(
            `delete temp tables ==> \x1b[33m${connectName}\x1b[32m`,
            await this.db(connectName)
              .raw(`DROP TABLE ${tables.slice(0, -1).slice(1).split(",")}`)
              .then(() => "✔")
              .catch((err: Error) => err.message)
          );
        if (
          update &&
          update["beforeAll"] &&
          Object.entries(update["beforeAll"]).length > 0
        ) {
          if (
            update &&
            update["beforeAll"] &&
            Object.entries(update["beforeAll"]).length > 0
          ) {
            Logs.head("beforeAll");
            try {
              Object.keys(this.configs)
                .filter((e) => e != "admin")
                .forEach((connectName: string) => {
                  update["beforeAll"].forEach((operation: string) => {
                    this.addToQueries(connectName, operation);
                  });
                });
              await this.executeQueries("beforeAll", true);
            } catch (error) {
              console.log(error);
            }
          }
        }
        return true;
      })
      .catch(async (err: Error) => {
        let returnResult = false;
        if (err["code"] === "28P01") {
          returnResult = await this.tryToCreateDB(connectName);
          if (returnResult === false) Logs.error(err.message);
        } else if (err["code"] === "3D000" && create == true) {
          Logs.debug(
            msg(infos.tryCreate, infos.db),
            this.configs[connectName].pg.database
          );
          returnResult = await this.tryToCreateDB(connectName);
        } else Logs.error(err);
        return returnResult;
      });
  }

  // wait postgres connection
  private async pgwait(options: IdbConnection): Promise<boolean> {
    const pool = new pg.Pool({ ...options, database: DEFAULT_DB });
    let passage = 1;

    const connect = async (): Promise<boolean> => {
      try {
        await pool.query("SELECT 1");
        Logs.bootingResult(
          msg(infos.dbOnline, options.database || "none"),
          TIMESTAMP()
        );
        await pool.end();
        return true;
      } catch (e) {
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

export const serverConfig = new Configuration(__dirname + `/${NODE_ENV}.json`);
