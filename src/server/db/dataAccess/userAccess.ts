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

export const userAccess = {
  getAll: async () => {
    return await serverConfig
      .db(ADMIN)
      .table("user")
      .select(
        Object.keys(_DBADMIN.Users.columns).filter(
          (word) => word.toLowerCase() != "password"
        )
      )
      .orderBy("id");
  },

  getSingle: async (id: string) => {
    return await serverConfig
      .db(ADMIN)
      .table("user")
      .select("*")
      .first()
      .where({ id: +id });
  },

  add: async (data: Iuser) => {
    return await serverConfig
      .db(ADMIN)
      .table("user")
      .insert({
        username: data.username,
        email: data.email,
        password: encrypt(data.password),
        database: data.database || "all",
        canPost: data.canPost || false,
        canDelete: data.canDelete || false,
        canCreateUser: data.canCreateUser || false,
        canCreateDb: data.canCreateDb || false,
        superAdmin: data.superAdmin || false,
        admin: data.admin || false,
      })
      .returning("*");
  },

  update: async (data: Iuser): Promise<Iuser | any> => {
    return await serverConfig
      .db(ADMIN)
      .table("user")
      .update({
        username: data.username,
        email: data.email,
        database: data.database,
        canPost: data.canPost || false,
        canDelete: data.canDelete || false,
        canCreateUser: data.canCreateUser || false,
        canCreateDb: data.canCreateDb || false,
        superAdmin: data.superAdmin || false,
        admin: data.admin || false,
      })
      .where({ id: data.id })
      .returning("*");
  },
};
