/**
 * columnList.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Ientity } from "../../types";

export const columnList = (input: Ientity) =>
  Object.keys(input.columns).filter((word) => !word.includes("_"));
