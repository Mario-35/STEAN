/**
 * Odatas Helpers.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { cleanStringComma } from "../../../helpers";
import { IpgQuery } from "../../../types";
export { postSqlFromPgVisitor } from "./postSqlFromPgVisitor";
export { oDataDateFormat } from "./oDataDateFormat";
export { blankRootPgVisitor } from "./blankRootPgVisitor";
export const createSql = (input: IpgQuery | undefined): string => input ? `SELECT ${input.select}\n FROM "${input.from}"\n ${input.where ? `WHERE ${input.where}\n` : ''}${input.groupBy ? `GROUP BY ${cleanStringComma(input.groupBy)}\n` : ''}${input.orderby ? `ORDER BY ${cleanStringComma(input.orderby,["ASC","DESC"])}\n` : ''}${input.skip && input.skip > 0 ? `OFFSET ${input.skip}\n` : ''} ${input.limit && input.limit > 0 ? `LIMIT ${input.limit}\n` : ''}` : 'Error';
