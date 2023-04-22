/**
 * countId.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const countId = (table: string) =>`SELECT count(id) FROM ${table}`;
