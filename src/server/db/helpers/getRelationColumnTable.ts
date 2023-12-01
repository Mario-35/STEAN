/**
 * getColumnType.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { getEntity } from ".";
import { EcolType } from "../../enums";
import { Ientity } from "../../types";

/**
 * 
 * @param entity entity name or entity
 * @param column column to test
 * @returns column postgresSql create string
 */
export const getRelationColumnTable = (entity: Ientity | string, test: string): EcolType | undefined => {
  const tempEntity = getEntity(entity);
  if (tempEntity)
    return tempEntity.relations.hasOwnProperty(test)
      ? EcolType.Relation
      : tempEntity.columns.hasOwnProperty(test)
        ? EcolType.Column
        : undefined;
};