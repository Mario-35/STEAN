/**
 * createSTDB.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createTable, getEntitesListFromConfig } from "../helpers";
import { serverConfig } from "../../configuration";
import { asyncForEach, isTest } from "../../helpers";
import { Logs } from "../../logger";
import { _DB, _RIGHTS } from "../constants";
import { testsDatas } from "./testsDatas";
import { IKeyString } from "../../types";
import { EextensionsType } from "../../enums";
import { _NOTOK, _OK } from "../../constants";
import { triggers } from "./triggers";

export const createSTDB = async (configName: string): Promise<IKeyString> => {
  Logs.head("createDatabase", "createDatabase");
  // init result
  const config = serverConfig.configs[configName].pg;
  const returnValue: IKeyString = { "Start create Database": config.database };
  const adminConnection = serverConfig.dbAdminFor(configName);
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
      await adminConnection.unsafe(`SELECT COUNT(*) FROM pg_user WHERE usename = '${config.user}';`)
        .then(async (res: object) => {
          if (res[0] == 0) {
            returnValue[`CREATE ROLE ${config.user}`] = await adminConnection.unsafe(`CREATE ROLE ${config.user} WITH PASSWORD '${config.password}' ${_RIGHTS}`)
              .then(() => _OK)
              .catch((err: Error) => err.message);
          } else {
            await adminConnection.unsafe(`ALTER ROLE ${config.user} WITH PASSWORD '${config.password}' ${_RIGHTS}`)
              .then(() => {
                returnValue[`Create/Alter ROLE`] = `${config.user} ${_OK}`;
              })
              .catch((err: Error) => {
                Logs.error(err);
              });
          }
        });
    })
    .catch((err: Error) => {
      Logs.error(err);
    });

    
    const dbConnection = serverConfig.db(configName);
    if (!dbConnection) {
    returnValue["DROP Error"] = `No DB connection ${_NOTOK}`;
    return returnValue;
  }
  
  // create postgis
  returnValue[`Create postgis`] = await dbConnection.unsafe('CREATE EXTENSION IF NOT EXISTS postgis')
    .then(() => _OK)
    .catch((err: Error) => err.message);

  // create postgis
  returnValue[`Create tablefunc`] = await dbConnection.unsafe('CREATE EXTENSION IF NOT EXISTS tablefunc')
    .then(() => _OK)
    .catch((err: Error) => err.message);
    
  // loop to create each table
  await asyncForEach(
    getEntitesListFromConfig(configName),
    async (keyName: string) => {
      const res = await createTable(configName, _DB[keyName], undefined);
      Object.keys(res).forEach((e: string) => Logs.create(e, res[e]));      
    }
  );
  
  // await dbConnection.begin(sql => {
  //   triggers
  //     .forEach(async (query: string) => {        
  //       const name = query.includes('FUNCTION') 
  //       ? `Create function ${query.split('CREATE OR REPLACE FUNCTION ')[1].split("(")[0]}`
  //       : `Create trigger ${query.split('CREATE TRIGGER')[1].split(" ")[0]}`;
  //       await sql.unsafe(query)
  //               .then(() => {
  //                 Logs.create(name, _OK);
  //               }).catch((error: Error) => {
  //                 console.log(error);
                  
  //                 Logs.error(name, _NOTOK);
  //               });
  //     });
  // });
  

  // loop to create each table
  await asyncForEach( triggers(configName), async (query: string) => {
    const name = query.split(" */")[0].split("/*")[1].trim();
    await serverConfig.db(configName).unsafe(query)
      .then(() => {
        Logs.create(name, _OK);
      }).catch((error: Error) => {
        console.log(error);
        process.exit(111);
      });    
    }
  );

  if (isTest()) await serverConfig.db(configName).begin(sql => {
    testsDatas().forEach(async (query: string) => {
      await sql.unsafe(query).catch((error: Error) => {
        console.log(error);
        process.exit(111);
      });  
    });
  });

  if ( serverConfig.configs[configName].extensions.includes( EextensionsType.numeric ) ) {
    await dbConnection.unsafe(`ALTER TABLE observation ALTER COLUMN result TYPE float4 USING null;`)
      .catch((error: Error) => {
        Logs.error(error);
        return error;
      });
    await dbConnection.unsafe(`ALTER TABLE historical_observation ALTER COLUMN _result TYPE float4 USING null;`)
      .catch((error) => {
        Logs.error(error);
        return error;
      });
  }

  await dbConnection.unsafe(`SELECT COUNT(*) FROM pg_user WHERE usename = '${config.user}';`)
    .then(() => {
      returnValue["Create DB"] = _OK;
    });
  return returnValue;
};
