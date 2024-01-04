/**
 * createAdminDB.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createTable } from "../helpers";
import { serverConfig } from "../../configuration";
import { addDoubleQuotes, addSimpleQuotes, asyncForEach } from "../../helpers";
import { formatLog } from "../../logger";
import { _RIGHTS } from "../constants";
import { ADMIN, _OK } from "../../constants";
import { IKeyString } from "../../types";
import { models } from "../../models";
import { log } from "../../log";

export const createAdminDB = async (): Promise<IKeyString> => {
  const _DBADMIN = models.DBAdmin(serverConfig.getConfig(ADMIN));
  console.log(formatLog.head("createAdminDB", "createDatabase"));
  const config = serverConfig.getConfig(ADMIN).pg;
  // init result
  const returnValue = { "Start create Database": config.database };
  await serverConfig
    .getConnectionAdminFor(ADMIN).unsafe(`CREATE DATABASE ${ADMIN}`)
    .then(async () => {
      returnValue["create Admin DB"] = _OK;
      returnValue["User"] = await serverConfig
        .getConnection(ADMIN).unsafe(`SELECT COUNT(*) FROM pg_user WHERE usename = ${addSimpleQuotes(config.user)};`)
        .then(async (res) => {
          if (res["rowCount"] < 1) {
            console.log(formatLog.result("Create User", config.user));
            return serverConfig
              .getConnection(ADMIN).unsafe(`CREATE ROLE ${addDoubleQuotes(config.user)} WITH PASSWORD ${addSimpleQuotes(config.password)} ${_RIGHTS};`)
              .then(() => { return `Create User ${_OK}`; })
              .catch((err: Error) => err.message);
          } else {
            console.log(formatLog.result("Update User", config.user));
            return await serverConfig
              .getConnection(ADMIN).unsafe(`ALTER ROLE ${addDoubleQuotes(config.user)} WITH PASSWORD ${addSimpleQuotes(config.password)} ${_RIGHTS};`)
              .then(() => { return `Update User ${_OK}`; })
              .catch((err: Error) => err.message);
            }
          });
        })
        .catch((err: Error) => { 
          log.errorMsg(err);
        });
        // loop to create each admin table
        await asyncForEach(Object.keys(_DBADMIN), async (keyName: string) => {
    await createTable(ADMIN, _DBADMIN[keyName], undefined);
  });

  returnValue["Configs"] = await serverConfig
    .getConnection(ADMIN).unsafe(`CREATE TABLE public.configs ( "date" timestamptz NULL DEFAULT CURRENT_TIMESTAMP, "key" text NULL, "config" text NOT NULL );`)
    .then(() => { return `Create Config Table ${_OK}`; })
    .catch((err: Error) => err.message);

  return returnValue;
};
