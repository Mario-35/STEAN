/**
 * getColumnResult.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const getColumnResult = (numeric: boolean, as: boolean, cast: string = "numeric") => `CASE WHEN jsonb_typeof("result"->'value') = 'number' THEN ("result"->${numeric ? '>': ''}'value')::${cast} END${as === true ? ' AS "result"' : ''}`; 

