/**
 * queryAsDataArray.
 *
 * @copyright 2020-present Inrae
 * @review 27-01-2024
 * @author mario.adam@inrae.fr
 *
 */

import { queryAsJson } from ".";
import { _COLUMNSEPARATOR, _NEWLINE } from "../../constants";
import { addDoubleQuotes, addSimpleQuotes, removeAllQuotes } from "../../helpers";
import { PgVisitor } from "../../odata";

export const queryAsDataArray = (input: PgVisitor): string => {
  const names:string[] = input.arrayNames.map(e => removeAllQuotes(e));
  // create names
  input.includes.forEach((include) => { names.push(include.entity); });
  // Return SQL query
  return queryAsJson({
    query: `SELECT (ARRAY[${_NEWLINE}\t${names
      .map((e: string) => addSimpleQuotes(e))
      .join( `,${_NEWLINE}\t`)}]) as "component", count(*) as "dataArray@iot.count", jsonb_agg(allkeys) as "dataArray" FROM (SELECT json_build_array(${_NEWLINE}\t${names.map((e: string) => addDoubleQuotes(e)).join(`,${_NEWLINE}\t`)}) as allkeys FROM (${input.sql}) as p) as l`,
    singular: false,
    count: false,
  });
}
