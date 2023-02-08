/**
 * Odatas Helpers.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _DBDATAS } from "../../../db/constants";
import { cleanStringComma, removeQuotes } from "../../../helpers";
import { PGQuery } from "../PgVisitor";

export const createSql = (input: PGQuery): string => `SELECT ${input.select}\n FROM "${input.from}"\n ${input.where ? `WHERE ${input.where}\n` : ''}${input.groupBy ? `GROUP BY ${cleanStringComma(input.groupBy)}\n` : ''}${input.orderby ? `ORDER BY ${cleanStringComma(input.orderby)}\n` : ''}${input.skip && input.skip > 0 ? `OFFSET ${input.skip}\n` : ''} ${input.limit && input.limit > 0 ? `LIMIT ${input.limit}\n` : ''}`;

export const  queryAsDataArray = (listOfKeys: { [key: string]: string } , query: string, singular: boolean, fields?: string[]): string => {    
    const sqlString = `SELECT (ARRAY['${Object.keys(listOfKeys).map((e:string) => removeQuotes(e)).join("','")}']) as "component", count(*) as "dataArray@iot.count", jsonb_agg(allkeys) as "dataArray" FROM (SELECT  json_build_array(${Object.values(listOfKeys).join()}) as allkeys FROM (${query}) as p) as l`;
    return queryAsJson(sqlString, singular, false, fields);
}

export const  queryAsJson = (query: string, singular: boolean, count: boolean, fields?: string[]): string => {  
    const returnJson: string = singular === true ? "ROW_TO_JSON" : "json_agg";
    const returnNull: string = singular === true ? "{}" : "[]";
    return `SELECT \n${count == true ? "count(t),\n" : ""} ${fields ? fields.join(",\n") : ""}coalesce(${returnJson}(t),\n '${returnNull}') AS results FROM (${query}) as t`;
};

export { createGetSql } from "./createGetSql";
export { createPostSql } from "./createPostSql";
export { createQuerySelectString, createQuerySelectPGQuery } from "./createQuery";
export { getColumnsList } from "./getColumnsList";
export { oDatatoDate } from "./oDatatoDate";
