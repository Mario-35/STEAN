/**
 * Constants for DataBase.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */


import { IcolumnOption, Ientity } from "../types";

export const _RIGHTS = "SUPERUSER CREATEDB NOCREATEROLE INHERIT LOGIN NOREPLICATION NOBYPASSRLS CONNECTION LIMIT -1";
export type _STREAM = "Datastream" | "MultiDatastream" | undefined;
export const getColumnResult = (numeric: boolean, as: boolean, cast: string = "numeric") => `CASE WHEN jsonb_typeof("result"->'value') = 'number' THEN ("result"->${numeric ? '>': ''}'value')::${cast} END${as === true ? ' AS "result"' : ''}`; 
export const getColumnNameOrAlias = (entity: Ientity, column : string, options: IcolumnOption) => {  
  const result = entity 
          && column != "" 
          && entity.columns[column] 
            ? entity.columns[column].columnAlias(options.test ? {...options.test, ...{"as": options.as}} : {"as": options.as}) 
            : undefined;
  return result ? `${options.table === true && result && result[0] === '"' ? `"${entity.table}".${result}` : result}` : undefined;        
}; 

export const getAllColumnName = (entity: Ientity, columns : string | string[], options: IcolumnOption): string[] => {
  const result: string[] = [];
  if (typeof columns === "string") columns = columns[0] === "*" ? Object.keys(entity.columns).filter((word) => !word.includes("_")) : columns.split(',');

  columns.forEach((column: string) => {
    const columnTemp = getColumnNameOrAlias(entity, column, options);
    if (columnTemp) result.push(columnTemp);
  });
  return result;
};


