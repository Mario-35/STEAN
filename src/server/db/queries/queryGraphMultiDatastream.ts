/**
 * queryGraphMultiDatastream.
*
* @copyright 2020-present Inrae
* @author results.adam@inrae.fr
*
*/

import { SIMPLEQUOTEDCOMA } from "../../constants";

export const queryGraphMultiDatastream = (table: string, id: string | bigint, splitResult: string[] | undefined, query: string): string =>
`  WITH stream AS (
    SELECT 
      * 
    FROM 
    ${table} 
    WHERE 
      id = ${id} 
  ), 
  src AS (
    SELECT 
      id, 
      description, 
      jsonb_array_elements("unitOfMeasurements")->> 'name' AS name, 
      jsonb_array_elements("unitOfMeasurements")->> 'symbol' AS symbol 
    FROM 
      stream
  ), 
  results AS (
    SELECT 
      src.id, 
      src.description, 
      src.name, 
      src.symbol, 
      (
        SELECT 
          STRING_AGG(concat, ',') AS datas 
        FROM 
          (
            ${query}
          ) AS nop
      ) 
    FROM 
      "multidatastream" 
      INNER JOIN src ON multidatastream.id = src.id
  ) 
  SELECT 
    * 
  FROM 
    results
    ${splitResult ? `WHERE name in ('${splitResult.join(SIMPLEQUOTEDCOMA)}')` :``}`;  