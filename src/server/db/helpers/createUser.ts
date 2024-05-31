 /**
 * createUser
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _OK } from "../../constants";
import { log } from "../../log";
import { IconfigFile } from "../../types";
import { _RIGHTS } from "../constants";
import { userAccess } from "../dataAccess";
// onsole.log("!----------------------------------- createUser -----------------------------------!");

export const createUser = async (config: IconfigFile): Promise<string> => {
  return new Promise(async function (resolve, reject) {
    await userAccess.post(config.name, {
      username: config.pg.user,
      email: "default@email.com",
      password: config.pg.password,
      database: config.pg.database,
      canPost: true,
      canDelete: true,
      canCreateUser: true,
      canCreateDb: true,
      superAdmin: false,
      admin: false})
    .then(() => { resolve(`${config.pg.user} ${_OK}`); })
    .catch((err: Error) => {
        log.errorMsg(err);
        reject(err);
    });
  });
};