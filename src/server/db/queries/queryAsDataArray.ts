/**
 * queryAsDataArray.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { queryAsJson } from ".";
import { _COLUMNSEPARATOR } from "../../constants";
import { addDoubleQuotes, removeAllQuotes } from "../../helpers";
import { PgVisitor } from "../../odata";

export const queryAsDataArray = (input: PgVisitor): string => {
  let names:string[] = input.arrayNames;
  input.includes.forEach((include) => {
    names = names.concat(include.arrayNames.map(e => `${addDoubleQuotes(include.entity)}->'${removeAllQuotes(e)}'`));
  });
  const cols = input.parentEntity ? names.map(e => addDoubleQuotes(e)) : names;
  return queryAsJson({
    query: `SELECT (ARRAY['${names
      .map((e: string) => removeAllQuotes(e))
      .join( "','" )}']) as "component", count(*) as "dataArray@iot.count", jsonb_agg(allkeys) as "dataArray" FROM (SELECT json_build_array(${cols.join()}) as allkeys FROM (${input.sql}) as p) as l`,
    singular: false,
    count: false,
  });
}