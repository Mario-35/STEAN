/**
 * queryGraphDatastream.
*
* @copyright 2020-present Inrae
* @author results.adam@inrae.fr
*
*/

export const queryGraphDatastream = (table: string, id: string | bigint, query: string): string => `SELECT ( SELECT CONCAT( description, '|', "unitOfMeasurement" ->> 'name', '|', "unitOfMeasurement" ->> 'symbol' ) FROM "${table}" WHERE id = ${id} ) AS infos, STRING_AGG(concat, ',') AS datas FROM (${query}) AS nop`;