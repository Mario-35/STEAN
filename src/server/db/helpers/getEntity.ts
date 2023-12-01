/**
 * getEntity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { getEntityName } from ".";
import { Ientity } from "../../types";
import { _DB } from "../constants";

/**
 * 
 * @param entity entity or name or entity
 * @returns Ientity or undefined
 */
export const getEntity = (entity: Ientity | string): Ientity | undefined => {
    if (typeof entity === "string") {
      const entityName = getEntityName(entity.trim());
      if (!entityName) return;
      entity = entityName;
    } 
    return (typeof entity === "string") ? _DB[entity] : entity ;
  };