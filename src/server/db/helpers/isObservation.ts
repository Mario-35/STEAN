/**
 * isCsvOrArray.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Ientity } from "../../types";
import { _DBDATAS } from "../constants";

export const isObservation = (input: Ientity | string) => (typeof input === "string") ? input === _DBDATAS.Observations.name : input.name === _DBDATAS.Observations.name;
