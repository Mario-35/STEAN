/**
 * isCsvOrArray.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Ientity } from "../../types";
import { _DB } from "../constants";

export const isObservation = (input: Ientity | string) => (typeof input === "string") ? input === _DB.Observations.name : input.name === _DB.Observations.name;
