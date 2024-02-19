/**
 * getColumnResult.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const getColumnResult = (numeric: boolean, valueskeys: boolean, as: boolean, cast: string = "numeric") => 
`CASE 
    WHEN jsonb_typeof("result"->'value') = 'number' THEN ("result"->${numeric == true? '>': ''}'value')::jsonb
    WHEN jsonb_typeof("result"->'value') = 'array' THEN ("result"->'${valueskeys == true ? 'valueskeys' : 'value'}')::jsonb
END${as === true ? ' AS "result"' : ''}`; 

