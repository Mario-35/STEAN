"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.multiDatastreamKeys=void 0;const multiDatastreamKeys=t=>`SELECT 
    jsonb_agg(tmp.units -> 'name') AS keys 
FROM 
    (
        SELECT 
            jsonb_array_elements("unitOfMeasurements") AS units 
        FROM 
            "multidatastream" 
        WHERE 
            id = ${t}
    ) AS tmp`;exports.multiDatastreamKeys=multiDatastreamKeys;