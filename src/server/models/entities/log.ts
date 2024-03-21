/**
 * entity Log.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";

export const Log:Ientity = {
    name: "Logs",
    singular: "Log",
    table: "logs",
    createOrder: -1,
    order: -1,
    extensions: [EextensionsType.logs],
    orderBy: `"date DESC"`,
    count: `SELECT count(DISTINCT id) from "logs" AS count` ,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias(config: IconfigFile, test: IKeyBoolean) {
           return `"id"${test["alias"] && test["alias"] === true  === true ? ` AS "@iot.id"`: ''}` ;
        },
        type: "number",
      },
      date: {
        create: "timestamptz DEFAULT CURRENT_TIMESTAMP",
        columnAlias() {
          return undefined;
        },
        type: "date",
      },
      user_id: {
        create: "BIGINT",
        columnAlias() {
          return undefined;
        },
        type: "number",
      },
      method: {
        create: "text",
        columnAlias() {
          return undefined;
        },
        type: "text",
      },
      code: {
        create: "INT",
        columnAlias() {
          return undefined;
        },
        type: "number",
      },
      url: {
        create: "text NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "text",
      },
      datas: {
        create: "jsonb NULL",
        columnAlias() {
          return undefined;
        },
        type: "json",
      },
      database: {
        create: "text NULL",
        columnAlias() {
          return undefined;
        },
        type: "text",
      },
      returnid: {
        create: "text NULL",
        columnAlias() {
          return undefined;
        },
        type: "text",
      },
      error: {
        create: "jsonb NULL",
        columnAlias() {
          return undefined;
        },
        type: "json",
      },
    },
    relations: {},
  };