/**
 * isColumnType.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { getEntity } from ".";
import { Ientity } from "../../types";
import { _DB } from "../constants";

/**
 * 
 * @param entity entity name or entity
 * @param column column to test
 * @param test type of column
 * @returns boolean
 */
export const isColumnType = (entity: Ientity | string, column: string , test: string): boolean => {
    const tempEntity = getEntity(entity);
    return tempEntity && tempEntity.columns[column] ? (tempEntity.columns[column].type.toLowerCase() === test.toLowerCase()) : false;
  };