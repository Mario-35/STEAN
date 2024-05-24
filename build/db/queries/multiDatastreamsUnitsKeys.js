"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.multiDatastreamsUnitsKeys=void 0;const multiDatastreamsUnitsKeys=t=>`SELECT 
    jsonb_agg(tmp.units -> 'name') AS keys 
FROM (
  SELECT 
    jsonb_array_elements("unitOfMeasurements") AS units 
  FROM 
    "multidatastream" 
  WHERE 
    id = ${t}
) AS tmp`;exports.multiDatastreamsUnitsKeys=multiDatastreamsUnitsKeys;