 /**
 * createUser.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IconfigFile } from "../../types";
import { userAccess } from "../dataAccess";

export const createUser = async (config: IconfigFile): Promise<boolean> => {
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
        admin: false
      });
      return true;
};