"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.interval=void 0;const interval=e=>e.interval?`WITH src as (${e.toString()}), 
range_values AS (
    SELECT 
        min(srcdate) as minval, 
        max(srcdate) as maxval 
    FROM 
        src
), 
time_range AS (
    SELECT 
        generate_series( minval :: timestamp, maxval :: timestamp, '${e.interval||"1 day"}' :: interval ):: TIMESTAMP WITHOUT TIME ZONE as step 
    FROM 
        range_values
) 
SELECT 
    ${e.intervalColumns?e.intervalColumns.join(", "):""} 
FROM 
    src RIGHT JOIN time_range on srcdate = step`:e.toString();exports.interval=interval;