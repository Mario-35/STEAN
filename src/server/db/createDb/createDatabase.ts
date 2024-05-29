/**
 * createSTDB.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- createSTDB. -----------------------------------!");
import { createTable, createUser } from "../helpers";
import { serverConfig } from "../../configuration";
import { addDoubleQuotes, addSimpleQuotes, asyncForEach } from "../../helpers";
import { formatLog } from "../../logger";
import { _RIGHTS } from "../constants";
import { IKeyString } from "../../types";
import { EnumExtensions } from "../../enums";
import { _NOTOK, _OK } from "../../constants";
import { triggers } from "./triggers";
import { models } from "../../models";
import { log } from "../../log";

export const createDatabase = async (configName: string): Promise<IKeyString> => {
  console.log(formatLog.head("createDatabase", configName));
  // init result
  const config = serverConfig.getConfig(configName).pg;
  const returnValue: IKeyString = { "Start create Database": config.database };
  const adminConnection = serverConfig.connectionAdminFor(configName);
  // Test connection Admin
  if (!adminConnection) {
    returnValue["DROP Error"] = "No Admin connection";
    return returnValue;
  }

  // create blank DATABASE
  await adminConnection.unsafe(`CREATE DATABASE ${config.database}`)
    .then(async () => {
      returnValue[`Create Database`] = `${config.database} ${_OK}`;
      // create USER if not exist
      await adminConnection.unsafe(`SELECT COUNT(*) FROM pg_user WHERE usename = ${addSimpleQuotes(config.user)};`)
        .then(async (res: Record<string, any>) => {
          if (res[0].count == 0) {            
            returnValue[`CREATE ROLE ${config.user}`] = await adminConnection.unsafe(`CREATE ROLE ${config.user} WITH PASSWORD ${addSimpleQuotes(config.password)} ${_RIGHTS}`)
              .then(() => _OK)
              .catch((err: Error) => err.message);
          } else {
            await adminConnection.unsafe(`ALTER ROLE ${config.user} WITH PASSWORD ${addSimpleQuotes(config.password)}  ${_RIGHTS}`)
              .then(() => {
                returnValue[`Create/Alter ROLE`] = `${config.user} ${_OK}`;
              })
              .catch((err: Error) => {
                log.errorMsg(err);
              });
          }

        });
    }).catch((err: Error) => {
      log.errorMsg(err);
    });

    const dbConnection = serverConfig.connection(configName);
    if (!dbConnection) {
      returnValue["DROP Error"] = `No DB connection ${_NOTOK}`;
      return returnValue;
    }
  
  // create postgis
  returnValue[`Create postgis`] = await dbConnection.unsafe('CREATE EXTENSION IF NOT EXISTS postgis')
    .then(() => _OK)
    .catch((err: Error) => err.message);
    
  // create tablefunc
  returnValue[`Create tablefunc`] = await dbConnection.unsafe('CREATE EXTENSION IF NOT EXISTS tablefunc')
    .then(() => _OK)
    .catch((err: Error) => err.message);
    
  // Get complete model
  const DB = models.DBFull(configName);
  
  // loop to create each table
  await asyncForEach(
    Object.keys(DB),
    async (keyName: string) => {
      const res = await createTable(configName, DB[keyName], undefined);
      Object.keys(res).forEach((e: string) => log.create(e, res[e]));      
    }
  );

  // loop to create each table
  await asyncForEach( triggers(configName), async (query: string) => {
    const name = query.split(" */")[0].split("/*")[1].trim();
    await serverConfig.connection(configName).unsafe(query)
      .then(() => {
        log.create(name, _OK);
      }).catch((error: Error) => {
        console.log(error);
        process.exit(111);
      });    
    }
  );

  // If only numeric extension
  if ( serverConfig.getConfig(configName).extensions.includes( EnumExtensions.highPrecision ) ) {
    await dbConnection.unsafe(`ALTER TABLE ${addDoubleQuotes(DB.Observations.table)} ALTER COLUMN 'result' TYPE float4 USING null;`)
      .catch((error: Error) => {
        log.errorMsg(error);
        return error;
      });
    await dbConnection.unsafe(`ALTER TABLE ${addDoubleQuotes(DB.HistoricalLocations.table)}  ALTER COLUMN '_result' TYPE float4 USING null;`)
      .catch((error) => {
        log.errorMsg(error);
        return error;
      });
  }

  returnValue[`Create user`] = await createUser(serverConfig.getConfig(configName))
    .then(() => _OK)
    .catch((err: Error) => err.message);

  await dbConnection.unsafe(`SELECT COUNT(*) FROM pg_user WHERE usename = ${addSimpleQuotes(config.user)};`)
    .then(() => { returnValue["ALL finished ..."] = _OK; });
    
  return returnValue;
};
