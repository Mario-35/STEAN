/**
 * User dataAccess.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Iuser } from "../../types";
import { encrypt } from "../../helpers";
import { serverConfig } from "../../configuration";
import { ADMIN } from "../../constants";
import { models } from "../../models";

const cols = () => Object.keys(models.DBAdmin(serverConfig.getConfig(ADMIN)).Users.columns);
export const userAccess = {
  getAll: async () => {
    const query = await serverConfig
      .connection(ADMIN)<Iuser[]>`SELECT ${serverConfig.connection(ADMIN)(cols())} FROM ${serverConfig.connection(ADMIN)(models.DBAdmin(serverConfig.getConfig(ADMIN)).Users.table)} ORDER BY id`;
    return query[0];
  },

  getSingle: async (id: string | number) => {
    id = (typeof id === "number") ? String(id) : id;    
    const query = await serverConfig
      .connection(ADMIN)<Iuser[]>`SELECT ${serverConfig.connection(ADMIN)(cols())} FROM ${serverConfig.connection(ADMIN)(models.DBAdmin(serverConfig.getConfig(ADMIN)).Users.table)} WHERE id = ${+id} LIMIT 1`;
      if (query.length === 1) return query[0];
  },

  post: async (configName: string, data: Iuser) => {
    // if (configName === "ADMIN") return;    
    return await serverConfig
      .connection(configName).unsafe(`INSERT INTO "user" 
      ("username", "email", "password", "database", "canPost", "canDelete", "canCreateUser", "canCreateDb", "superAdmin", "admin") 
       VALUES ('${data.username}', '${data.email}', '${encrypt(data.password)}', '${data.database || "all"}', ${data.canPost || false}, ${data.canDelete || false}, ${data.canCreateUser || false}, ${data.canCreateDb || false}, ${data.superAdmin || false}, ${data.admin || false}) 
      RETURNING *`).catch(async (err) => {
        if (err.code === "23505") {          
           const id = await serverConfig.connection(configName).unsafe(`SELECT id FROM "user" WHERE "username" = '${data.username}'`);
            if (id[0]) {
              data.id = id[0].id;
              return await serverConfig .connection(configName).unsafe(`UPDATE "user" SET "username" = '${data.username}', "email" = '${data.email}', "database" = '${data.database}', "canPost" = ${data.canPost || false}, "canDelete" = ${data.canDelete || false}, "canCreateUser" = ${data.canCreateUser || false}, "canCreateDb" = ${data.canCreateDb || false}, "superAdmin" = ${data.superAdmin || false}, "admin" = ${data.admin || false} WHERE "id" = ${data.id} RETURNING *`);
            }
        }
      })
  },

  update: async (configName: string, data: Iuser): Promise<Iuser | any> => {    
    return await serverConfig .connection(configName).unsafe(`UPDATE "user" SET "username" = '${data.username}', "email" = '${data.email}', "database" = '${data.database}', "canPost" = ${data.canPost || false}, "canDelete" = ${data.canDelete || false}, "canCreateUser" = ${data.canCreateUser || false}, "canCreateDb" = ${data.canCreateDb || false}, "superAdmin" = ${data.superAdmin || false}, "admin" = ${data.admin || false} WHERE "id" = ${data.id} RETURNING *`);
  }
};
