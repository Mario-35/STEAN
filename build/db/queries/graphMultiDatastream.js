"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.graphMultiDatastream=void 0;const _1=require("."),constants_1=require("../../constants"),graphMultiDatastream=(e,s,t,a)=>{const r="string"==typeof s?(0,_1.createIdList)(s):[String(s)];return 1===r.length?`WITH 
      src AS (
        SELECT 
          id, 
          description, 
          jsonb_array_elements("unitOfMeasurements")->>'name' AS name, 
          jsonb_array_elements("unitOfMeasurements")->>'symbol' AS symbol 
        FROM 
        (SELECT * FROM ${e} WHERE id = ${s} ) AS l
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
            FROM (
                ${a.replace("@GRAPH@",`CONCAT('[new Date("', round_minutes("resultTime", 5), '"), ', result->'value'->(select array_position(array(select jsonb_array_elements("unitOfMeasurements")->> 'name' FROM ( SELECT * FROM ${e} WHERE id = ${s} ) AS l), src.name)-1),']')`)}
                ) AS nop )
        FROM 
          "multidatastream" 
        INNER JOIN src ON multidatastream.id = src.id
      ) 
      SELECT * FROM results `+(t?`WHERE name in ('${t.join(constants_1.SIMPLEQUOTEDCOMA)}')`:""):`WITH 
  src AS (
    SELECT 
      id, 
      description, 
      jsonb_array_elements("unitOfMeasurements")->> 'name' AS name, 
      jsonb_array_elements("unitOfMeasurements")->> 'symbol' AS symbol 
    FROM 
    ( SELECT * FROM ${e} WHERE id = ${r[0]} ) AS l
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
            SELECT 
              CONCAT(
                '[new Date("', 
                TO_CHAR(date, 'YYYY/MM/DD HH24:MI'), 
                '"), ', 
                ${r.map((e,s)=>`coalesce(mario.res${s+1},'null'),','`)}, 
                ']'
              ) 
            FROM 
              (
                SELECT 
                  distinct COALESCE(
                    ${r.map((e,s)=>`result${s+1}.date`).join(",")}
                  ) AS date, 
                  ${r.map((e,s)=>`COALESCE(
                    result${s+1}.res :: TEXT, 'null'
                  ) AS res`+(s+1)).join(",")} 
                FROM ${r.map((e,s)=>`${1<s+1?"FULL JOIN ":""}
                (
                  SELECT 
                    round_minutes("resultTime", 15) as date, 
                    ${r.filter(e=>+e!==s+1).map((e,s)=>"null as res"+(s+1)).join(",")} ,
                    result -> 'value' ->(
                      select 
                        array_position(
                          array(
                            select jsonb_array_elements("unitOfMeasurements")->> 'name' FROM ( SELECT * FROM multidatastream WHERE id = ${r[s]} ) as one
                          ), src.name
                        )-1
                    ) as res
                  FROM 
                    "observation" 
                  WHERE 
                    "observation"."id" in (
                      SELECT 
                        "observation"."id" 
                      from 
                        "observation" 
                      WHERE 
                        "observation"."multidatastream_id" = ${r[s]}
                    ) 
                  ORDER BY 
                    "resultTime" ASC
                ) as result${s+1} `+(1<s+1?` ON result${s}.date = result${s+1}.date`:"")).join(" ")} 
              ) As mario
          ) AS nop
      ) 
    FROM 
      "multidatastream" 
      INNER JOIN src ON multidatastream.id = src.id
  ) 
  SELECT * FROM results`};exports.graphMultiDatastream=graphMultiDatastream;