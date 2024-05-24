"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.testId=void 0;const testId=(t,e)=>`SELECT 
CASE WHEN EXISTS(
  SELECT 
    1 
  FROM 
    "${t}" 
  WHERE 
    "id" = ${e}
) THEN (
  SELECT 
    "id" 
  FROM 
    "${t}" 
  WHERE 
    "id" = ${e}
) END AS "id"`;exports.testId=testId;