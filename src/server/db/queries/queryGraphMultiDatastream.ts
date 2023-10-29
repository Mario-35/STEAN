/**
 * queryGraphMultiDatastream.
*
* @copyright 2020-present Inrae
* @author results.adam@inrae.fr
*
*/

export const queryGraphMultiDatastream = (table: string, id: string | bigint, splitResult: string[] | undefined, query: string): string =>
`WITH src AS (
    SELECT 
      id, 
      description, 
      jsonb_array_elements("unitOfMeasurements")->> 'name' AS name, 
      jsonb_array_elements("unitOfMeasurements")->> 'symbol' AS symbol 
    FROM 
    ${table} 
    WHERE 
      id = ${id}
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
        FROM (${query}) AS nop
      ) 
    FROM 
      "multidatastream" 
      INNER JOIN src ON multidatastream.id = src.id
  )
  select * from results ${splitResult ? `where name in ('${splitResult.join("','")}')` :``}`;