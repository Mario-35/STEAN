/**
 * queryAsDataArray.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { queryAsJson } from ".";
import { removeQuotes } from "../../helpers";
import { PgVisitor } from "../../odata";

export const queryAsDataArray = (input: PgVisitor): string =>
  queryAsJson({
    query: `SELECT (ARRAY['${Object.keys(input.arrayNames)
      .map((e: string) => removeQuotes(e))
      .join(
        "','"
      )}']) as "component", count(*) as "dataArray@iot.count", jsonb_agg(allkeys) as "dataArray" FROM (SELECT  json_build_array(${Object.values(
      input.arrayNames
    ).join()}) as allkeys FROM (${input.sql}) as p) as l`,
    singular: false,
    count: false,
  });
