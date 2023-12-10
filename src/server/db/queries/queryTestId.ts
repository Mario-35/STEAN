/**
 * queryTestId.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/

export const queryTestId = (table: string, id: bigint | string): string => `SELECT CASE WHEN EXISTS(SELECT 1 FROM "${table}" WHERE "id" = ${id}) THEN (SELECT "id" FROM "${table}" WHERE "id" = ${id}) END AS "id"`;


