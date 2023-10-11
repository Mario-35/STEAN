/**
 * countId.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const countId = (table: string) =>`select * from row_estimator('select * from ${table}') AS count`;


