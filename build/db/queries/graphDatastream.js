"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.graphDatastream=void 0;const _1=require("."),graphDatastream=(e,t,a)=>{const r="string"==typeof t?(0,_1.createIdList)(t):[String(t)];return`SELECT ( 
            SELECT 
              CONCAT( description, '|', "unitOfMeasurement" ->> 'name', '|', "unitOfMeasurement" ->> 'symbol' ) 
            FROM "${e}"
              WHERE id = ${r[0]} 
           ) AS infos, 
    STRING_AGG(concat, ',') AS datas 
    `+(1===r.length?`FROM (${a.replace("@GRAPH@",`CONCAT('[new Date("', TO_CHAR("resultTime", 'YYYY/MM/DD HH24:MI'), '"), ', result->'value' ,']')`)}) AS nop`:` FROM (
            SELECT CONCAT( '[new Date("', TO_CHAR( date, 'YYYY/MM/DD HH24:MI' ), '"), ', ${r.map((e,t)=>`coalesce(mario.res${t+1},'null'),','`)}, ']' ) 
              FROM (
                SELECT 
                  distinct COALESCE( ${r.map((e,t)=>`result${t+1}.date`).join(",")} ) AS date, 
                  ${r.map((e,t)=>`COALESCE( result${t+1}.res :: TEXT, 'null' ) AS res`+(t+1)).join(",")} FROM ${r.map((e,t)=>`${1<t+1?"FULL JOIN ":""}
                  (
                    SELECT 
                      round_minutes("resultTime", 15) as date, 
                      ${r.filter(e=>+e!==t+1).map((e,t)=>"null as res"+(t+1)).join(",")} , 
                      result -> 'value' as res 
                    FROM 
                      "observation" 
                    WHERE 
                      "observation"."id" in ( SELECT "observation"."id" from "observation" WHERE "observation"."datastream_id" = ${r[t]} ) 
                    ORDER BY 
                      "resultTime" ASC
                  ) as result${t+1} `+(1<t+1?` ON result${t}.date = result${t+1}.date`:"")).join(" ")} 
              ) As mario
          ) AS nop`)};exports.graphDatastream=graphDatastream;