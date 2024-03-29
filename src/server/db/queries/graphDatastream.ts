/**
 * graphDatastream.
*
* @copyright 2020-present Inrae
* @author results.adam@inrae.fr
*
*/

import { createIdList } from ".";

export const graphDatastream = (table: string, id: string | bigint, query: string): string => {
  const ids = (typeof id === "string" ) ? createIdList(id) : [String(id)];
  return  `SELECT ( 
            SELECT 
              CONCAT( description, '|', "unitOfMeasurement" ->> 'name', '|', "unitOfMeasurement" ->> 'symbol' ) 
            FROM "${table}"
              WHERE id = ${ids[0]} 
           ) AS infos, 
    STRING_AGG(concat, ',') AS datas 
    ${ ids.length === 1 
      ? `FROM (${query.replace("@GRAPH@",`CONCAT('[new Date("', TO_CHAR("resultTime", 'YYYY/MM/DD HH24:MI'), '"), ', result->'value' ,']')`)}) AS nop`
      : ` FROM (
            SELECT CONCAT( '[new Date("', TO_CHAR( date, 'YYYY/MM/DD HH24:MI' ), '"), ', ${ids.map( (e,n) => `coalesce(mario.res${n+1},'null'),','` ) }, ']' ) 
              FROM (
                SELECT 
                  distinct COALESCE( ${ids.map((e,n) => `result${n+1}.date`).join(",")} ) AS date, 
                  ${ids.map((e,n)  => `COALESCE( result${n+1}.res :: TEXT, 'null' ) AS res${n+1}`).join(",")} FROM ${ids.map((e,n) => `${(n+1) > 1 ? 'FULL JOIN ' : ''}
                  (
                    SELECT 
                      round_minutes("resultTime", 15) as date, 
                      ${ids.filter((e: string) => +e !== (n+1)).map((e, n) => `null as res${n+1}`).join(",")} , 
                      result -> 'value' as res 
                    FROM 
                      "observation" 
                    WHERE 
                      "observation"."id" in ( SELECT "observation"."id" from "observation" WHERE "observation"."datastream_id" = ${ids[n]} ) 
                    ORDER BY 
                      "resultTime" ASC
                  ) as result${n+1} ${ (n+1) > 1 ? ` ON result${n}.date = result${n+1}.date` : '' }`).join(" ")} 
              ) As mario
          ) AS nop`
      }`
};