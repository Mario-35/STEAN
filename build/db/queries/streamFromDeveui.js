"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.streamFromDeveui=void 0;const streamFromDeveui=a=>`WITH multidatastream as (
  SELECT 
    json_agg(t) AS multidatastream 
  FROM 
    (
      SELECT 
        id as multidatastream, 
        id, 
        _default_foi, 
        thing_id, 
        (
          SELECT 
            jsonb_agg(tmp.units -> 'name') AS keys 
          FROM 
            (
              SELECT 
                jsonb_array_elements("unitOfMeasurements") AS units
            ) AS tmp
        ) 
      FROM 
        "multidatastream" 
      WHERE 
        "multidatastream".id = (
          SELECT 
            "lora"."multidatastream_id" 
          FROM 
            "lora" 
          WHERE 
            "lora"."deveui" = '${a}'
        )
    ) as t
), 
datastream as (
  SELECT 
    json_agg(t) AS datastream 
  FROM 
    (
      SELECT 
        id as datastream, 
        id, 
        _default_foi, 
        thing_id, 
        '{}' :: jsonb as keys 
      FROM 
        "datastream" 
      WHERE 
        "datastream".id = (
          SELECT 
            "lora"."datastream_id" 
          FROM 
            "lora" 
          WHERE 
            "lora"."deveui" = '${a}'
        )
    ) as t
) 
SELECT 
  datastream.datastream, 
  multidatastream.multidatastream 
FROM 
  multidatastream, 
  datastream`;exports.streamFromDeveui=streamFromDeveui;