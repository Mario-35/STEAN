/**
 * entity Log
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- entity Log -----------------------------------!");

import { createEntity } from ".";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";
import { _id, _text } from "./constants";

export const Log:Ientity  = createEntity("Logs", {
    createOrder: -1,
    order: -1,
    orderBy: `"date DESC"`,
    columns: {
      id: {
        create: _id,
        alias(config: IconfigFile, test: IKeyBoolean) {
           return `"id"${test["alias"] && test["alias"] === true  === true ? ` AS "@iot.id"`: ''}` ;
        },
        type: "number",
      },
      date: {
        create: "timestamptz DEFAULT CURRENT_TIMESTAMP",
        alias() {},
        type: "date",
      },
      user_id: {
        create: "BIGINT NULL",
        alias() {},
        type: "number",
      },
      method: {
        create: "TEXT NULL",
        alias() {},
        type: "text",
      },
      code: {
        create: "INT NULL",
        alias() {},
        type: "number",
      },
      url: {
        create: _text(), 
        alias() {},
        type: "text",
      },
      datas: {
        create: "JSONB NULL",
        alias() {},
        type: "json",
      },
      database: {
        create: "TEXT NULL",
        alias() {},
        type: "text",
      },
      returnid: {
        create: "TEXT NULL",
        alias() {},
        type: "text",
      },
      error: {
        create: "JSONB NULL",
        alias() {},
        type: "json",
      },
    },
    relations: {},
  });