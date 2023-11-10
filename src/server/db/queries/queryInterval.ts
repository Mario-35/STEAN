/**
 * queryInterval.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/

import { PgVisitor } from "../../odata";

export const queryInterval = (input: PgVisitor): string => 
input.interval 
    ? `WITH src as (${input.sql}), 
        range_values AS (
        SELECT 
            min(srcdate) as minval, 
            max(srcdate) as maxval FROM src
        ), 
        time_range AS (
        SELECT 
            generate_series(
            minval :: timestamp, maxval :: timestamp, 
            '${input.interval || "1 day"}' :: interval
            ):: TIMESTAMP WITHOUT TIME ZONE as step FROM range_values
        ) SELECT ${input.blanks ? input.blanks.join(", ") : '' } 
        FROM 
        src RIGHT 
        JOIN time_range on srcdate = step`
    : input.sql;


