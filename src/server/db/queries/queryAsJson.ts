/**
 * queryAsJson.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/

export const queryAsJson = (input: {
    query: string;
    singular: boolean;
    count: boolean;
    mario?: string;
    fields?: string[]
  }): string => input.query.trim() === "" ? "": `SELECT ${input.count == true ? `\t${input.mario ? `(${input.mario})` : 'count(t)'},\n\t` : ""}${input.fields ? input.fields.join(",\n\t") : ""}coalesce(${input.singular === true ? "ROW_TO_JSON" : "json_agg"}(t), '${input.singular === true ? "{}" : "[]"}') AS results\n\tFROM (\n\t${input.query}) as t`;
