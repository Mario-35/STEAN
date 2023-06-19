/**
 * isSingular.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { getEntityName } from "../../helpers";
import { _DB } from "../constants";

export const isSingular = (input: string): boolean => { const entityName = getEntityName(input); return entityName ? (_DB[entityName].singular == input) : false; };
