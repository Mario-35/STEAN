/**
 * getAllColumnName.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { getColumnNameOrAlias } from ".";
import { IconfigFile, Ientity, IcolumnOption } from "../../types";

export const getAllColumnName = (config: IconfigFile, entity: Ientity, columns : string | string[], options: IcolumnOption): string[] => {
  const result: string[] = [];
  if (typeof columns === "string") columns = columns[0] === "*" ? Object.keys(entity.columns).filter((word) => !word.includes("_")) : columns.split(',');

  columns.forEach((column: string) => {
    const columnTemp = getColumnNameOrAlias(config, entity, column, options);
    if (columnTemp) result.push(columnTemp);
  });
  return result;
};


