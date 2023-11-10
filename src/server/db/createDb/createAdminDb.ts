/**
 * createAdminDB.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createTable } from "../helpers";
import { serverConfig } from "../../configuration";
import { asyncForEach } from "../../helpers";
import { Logs } from "../../logger";
import { _DBADMIN, _RIGHTS } from "../constants";
import { ADMIN, _OK } from "../../constants";
import { IKeyString } from "../../types";

export const createAdminDB = async (): Promise<IKeyString> => {
  Logs.head("createAdminDB", "createDatabase");
  const config = serverConfig.configs[ADMIN].pg;
  // init result
  const returnValue = { "Start create Database": config.database };
  await serverConfig
    .dbAdminFor(ADMIN).unsafe(`CREATE DATABASE ${ADMIN}`)
    .then(async () => {
      returnValue["create Admin DB"] = _OK;
      returnValue["User"] = await serverConfig
        .db(ADMIN).unsafe(`SELECT COUNT(*) FROM pg_user WHERE usename = '${config.user}';`)
        .then(async (res) => {
          if (res["rowCount"] < 1) {
            Logs.infoSystem("Create User", config.user);
            return serverConfig
              .db(ADMIN).unsafe(`CREATE ROLE ${config.user} WITH PASSWORD '${config.password}' ${_RIGHTS};`)
              .then(() => { return `Create User ${_OK}`; })
              .catch((err: Error) => err.message);
          } else {
            Logs.infoSystem("Update User", config.user);
            return await serverConfig
              .db(ADMIN).unsafe(`ALTER ROLE ${config.user} WITH PASSWORD '${config.password}' ${_RIGHTS};`)
              .then(() => { return `Update User ${_OK}`; })
              .catch((err: Error) => err.message);
          }
        });
    })
    .catch((err: Error) => { Logs.error(err.message); });
  // loop to create each admin table
  await asyncForEach(Object.keys(_DBADMIN), async (keyName: string) => {
    await createTable(ADMIN, _DBADMIN[keyName], undefined);
  });
  return returnValue;
};
