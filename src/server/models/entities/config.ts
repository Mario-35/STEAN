/**
 * entity Config.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType } from "../../enums";
import { Ientity } from "../../types";

  export const Config:Ientity = {
    name: "Configs",
    singular: "Config",
    table: "",
    createOrder: -1,
    order: 20,
    extensions: [EextensionsType.logs, EextensionsType.admin],
    orderBy: `"name"`,
    columns: {},
    relations: {},
    constraints: {},
    indexes: {},
  };