/**
 * entity CreateObservation.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType } from "../../enums";
import { Ientity } from "../../types";

export const CreateObservation:Ientity = {
    name: "CreateObservations",
    singular: "CreateObservation",
    table: "",
    createOrder: 99,
    order: 0,
    extensions: [EextensionsType.base],
    orderBy: "",
    columns: {},
    relations: {},
    constraints: {},
    indexes: {},
};