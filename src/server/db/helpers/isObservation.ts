/**
 * isCsvOrArray.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Ientity } from "../../types";
import { DBDATAS } from "../constants";

export const isObservation = (input: Ientity | string) => (typeof input === "string") ? input === DBDATAS.Observations.name : input.name === DBDATAS.Observations.name;
