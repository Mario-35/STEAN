/**
 * entity CreateFile.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType } from "../../enums";
import { Ientity } from "../../types";
  
  export const CreateFile:Ientity = {
    name: "CreateFile",
    singular: "CreateFile",
    table: "",
    createOrder: 99,
    order: 0,
    extensions: [EextensionsType.base],
    orderBy: "",
    count: "",
    columns: {},
    relations: {},
    constraints: {},
    indexes: {},
  };