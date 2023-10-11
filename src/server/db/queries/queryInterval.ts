/**
 * queryInterval.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/

import { queryAsJson } from ".";
import { PgVisitor } from "../../odata";

export const queryInterval = (input: PgVisitor): string => {
    input.sql = input.interval 
        ? `WITH src as (\n\t${input.sql}), 
            \n\trange_values AS (
            SELECT 
                \n\t\tmin(srcdate) as minval, 
                \n\t\tmax(srcdate) as maxval \n\tFROM src
            ), 
            \n\ttime_range AS (
            SELECT 
                \n\t\tgenerate_series(
                minval :: timestamp, maxval :: timestamp, 
                '${input.interval || "1 day"}' :: interval
                ):: TIMESTAMP WITHOUT TIME ZONE as step \n\tFROM range_values
            ) \n\tSELECT ${input.blanks ? input.blanks.join(", \n\t") : '' } 
            FROM 
            src \n\t\tRIGHT 
            JOIN time_range on srcdate = step`
        : input.sql;
    return queryAsJson({query: input.sql, singular: false, count: true});
  };