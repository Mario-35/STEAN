/**
 * Odatas Helpers.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { cleanStringComma } from "../../../helpers";
import { IpgQuery } from "../../../types";
export { createGetSql } from "./createGetSql";
export { createPostSql } from "./createPostSql";
export { createQueryString, createPgQuery } from "./createQuery";
export { getColumnsList } from "./getColumnsList";
export { oDatatoDate } from "./oDatatoDate";
export const createSql = (input: IpgQuery): string => `SELECT ${input.select}\n FROM "${input.from}"\n ${input.where ? `WHERE ${input.where}\n` : ''}${input.groupBy ? `GROUP BY ${cleanStringComma(input.groupBy)}\n` : ''}${input.orderby ? `ORDER BY ${cleanStringComma(input.orderby)}\n` : ''}${input.skip && input.skip > 0 ? `OFFSET ${input.skip}\n` : ''} ${input.limit && input.limit > 0 ? `LIMIT ${input.limit}\n` : ''}`;
