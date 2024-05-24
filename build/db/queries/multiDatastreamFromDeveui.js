"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.multiDatastreamFromDeveui=void 0;const multiDatastreamFromDeveui=e=>`(SELECT 
      jsonb_agg(tmp.units -> 'name') AS keys 
    FROM 
      ( SELECT jsonb_array_elements("unitOfMeasurements") AS units ) AS tmp
  ) 
  FROM 
    "multidatastream" 
  WHERE 
    "multidatastream".id = ( SELECT "lora"."multidatastream_id" FROM "lora" WHERE "lora"."deveui" = '${e}' )`;exports.multiDatastreamFromDeveui=multiDatastreamFromDeveui;