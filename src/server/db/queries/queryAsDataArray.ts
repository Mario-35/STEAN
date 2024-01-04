/**
 * queryAsDataArray.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { queryAsJson } from ".";
import { removeAllQuotes } from "../../helpers";
import { PgVisitor } from "../../odata";

export const queryAsDataArray = (input: PgVisitor): string => queryAsJson({
    query: `SELECT (ARRAY['${input.arrayNames
      .filter((e: string) => e.trim() != "")
      .map((e: string) => removeAllQuotes(e))
      .join( "','" )}']) as "component", count(*) as "dataArray@iot.count", jsonb_agg(allkeys) as "dataArray" FROM (SELECT json_build_array(${input.arrayNames.filter(e => e != "").join()}) as allkeys FROM (${input.sql}) as p) as l`,
    singular: false,
    count: false,
  });