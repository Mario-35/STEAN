/**
 * getSelectColumnList.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Ientity } from "../../types";

export const getSelectColumnList = (input: Ientity) => Object.keys(input.columns).filter((word) => !word.includes("_")).map((e: string) => `"${input.table}"."${e}"`);
