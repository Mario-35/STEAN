/**
 * User dataAccess.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Iuser } from "../../types";
import { encrypt } from "../../helpers";
import { _DBADMIN } from "../constants";
import { serverConfig } from "../../configuration";
import { ADMIN } from "../../constants";

const cols = () => Object.keys(_DBADMIN.Users.columns);
// const cols = () => Object.keys(_DBADMIN.Users.columns).filter( (word) => word.toLowerCase() != "password" );

export const userAccess = {
  getAll: async () => {
    // return await serverConfig.db(ADMIN).unsafe(`SELECT "${cols().join('","')}" FROM "${_DBADMIN.Users.table}" ORDER BY "id"`);
    const query = await serverConfig.db(ADMIN)<Iuser[]>`SELECT ${serverConfig.db(ADMIN)(cols())} FROM ${serverConfig.db(ADMIN)(_DBADMIN.Users.table)} ORDER BY id`;       
    return query[0];
  },

  getSingle: async (id: string) => {
    const query = await serverConfig.db(ADMIN)<Iuser[]>`SELECT ${serverConfig.db(ADMIN)(cols())} FROM ${serverConfig.db(ADMIN)(_DBADMIN.Users.table)} WHERE id = ${+id} LIMIT 1`;       
    if (query.length === 1) return query[0];
  },

  add: async (data: Iuser) => {
    return await serverConfig
      .db(ADMIN).unsafe(`INSERT INTO "user" ("email", "password", "database", "canPost", "canDelete", "canCreateUser", "canCreateDb", "superAdmin", "admin") 
      VALUES ('${data.username}', '${data.email}', '${encrypt(data.password)}', '${data.database || "all"}', ${data.canPost || false}, ${data.canDelete || false}, ${data.canCreateUser || false}, ${data.canCreateDb || false}, ${data.superAdmin || false}, ${data.admin || false}) 
      RETURNING *`);
  },

  update: async (data: Iuser): Promise<Iuser | any> => {
    return await serverConfig
      .db(ADMIN).unsafe(`UPDATE "user" SET "username" = '${data.username}', "email" = '${data.email}', "database" = '${data.database}', "canPost" = ${data.canPost || false}, "canDelete" = ${data.canDelete || false}, "canCreateUser" = ${data.canCreateUser || false}, "canCreateDb" = ${data.canCreateDb || false}, "superAdmin" = ${data.superAdmin || false}, "admin" = ${data.admin || false} WHERE "id" = ${data.id} RETURNING *`);
  }
};
