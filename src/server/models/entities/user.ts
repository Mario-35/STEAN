/**
 * entity User.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType } from "../../enums";
import { Ientity } from "../../types";

  export const User:Ientity = {
    name: "Users",
    singular: "User",
    table: "user",
    createOrder: -1,
    order: 21,
    extensions: [EextensionsType.admin],
    orderBy: `"name"`,
    count: `SELECT count(DISTINCT id) from "user" AS count` ,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return undefined;
        },
        type: "bigint"
      },
      username: {
        create: "text NOT NULL UNIQUE",
        columnAlias() {
          return undefined;
        },
        type: "string"
      },
      email: {
        create: "text NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "string"
      },
      password: {
        create: "text NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "string"
      },
      database: {
        create: "text NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "string"
      },
      canPost: {
        create: "bool NULL",
        columnAlias() {
          return undefined;
        },
        type: "boolean"
      },
      canDelete: {
        create: "bool NULL",
        columnAlias() {
          return undefined;
        },
        type: "boolean"
      },
      canCreateUser: {
        create: "bool NULL",
        columnAlias() {
          return undefined;
        },
        type: "boolean"
      },
      canCreateDb: {
        create: "bool NULL",
        columnAlias() {
          return undefined;
        },
        type: "boolean"
      },
      admin: {
        create: "bool NULL",
        columnAlias() {
          return undefined;
        },
        type: "boolean"
      },
      superAdmin: {
        create: "bool NULL",
        columnAlias() {
          return undefined;
        },
        type: "boolean"
      },
    },
    relations: {},
  };