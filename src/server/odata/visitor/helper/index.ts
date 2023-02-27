/**
 * Odatas Helpers.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _DBDATAS } from "../../../db/constants";
import { cleanStringComma } from "../../../helpers";
import { PGQuery } from "../PgVisitor";

// const  queryAsStep = (query: string, interval: string | undefined): string => {
//     return interval 
//         ? `\nWITH src as (\n${query}), \n\trange_values AS (SELECT \n\t\tmin(src.date) as minval, \n\t\tmax(src.date) as maxval \n\tFROM src), \n\ttime_range AS (SELECT \n\t\tgenerate_series(minval::timestamp, maxval::timestamp , '${interval || "1 day"}'::interval)::TIMESTAMP WITHOUT TIME ZONE as step \n\tFROM range_values) \n\tSELECT id, \n\t\tstep as date, \n\t\tresult FROM src \n\t\tRIGHT JOIN time_range on date = step`
//         : query;
// };

export const createSql = (input: PGQuery): string => `SELECT ${input.select}\n FROM "${input.from}"\n ${input.where ? `WHERE ${input.where}\n` : ''}${input.groupBy ? `GROUP BY ${cleanStringComma(input.groupBy)}\n` : ''}${input.orderby ? `ORDER BY ${cleanStringComma(input.orderby)}\n` : ''}${input.skip && input.skip > 0 ? `OFFSET ${input.skip}\n` : ''} ${input.limit && input.limit > 0 ? `LIMIT ${input.limit}\n` : ''}`;




export { createGetSql } from "./createGetSql";
export { createPostSql } from "./createPostSql";
export { createQuerySelectString, createQuerySelectPGQuery } from "./createQuery";
export { getColumnsList } from "./getColumnsList";
export { oDatatoDate } from "./oDatatoDate";

// export const  queryAsGraph = (query: string, interval: string | undefined): string => {
//     return queryAsJson(queryAsStep(query, interval), false, true);
// };
