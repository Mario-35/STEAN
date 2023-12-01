/**
 * formatColumnValue.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/

import { ESCAPE_ARRAY_JSON, ESCAPE_SIMPLE_QUOTE } from "../../constants";

function isObject(value: unknown) {
    return typeof value === 'object' && value !== null;
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatColumnValue(value: any, type: string): string | undefined {
    if (!value) return;
    if (value === void 0) {
      return '';
    } else if (value === null) {
      return 'null';
    } else if (value && value.isRawInstance) {
      return value.toQuery();
    } else if (type === 'number') {
        return value;
    } else if (type === 'bool') {
      if (value === 'false') value = 0;
      return `'${value ? 1 : 0}'`;
    } else if ((type === 'json' || type === 'jsonb') && isObject(value)) {
      return `'${ESCAPE_SIMPLE_QUOTE(JSON.stringify(value))}'`;
    } else if (type === 'text[]') {   
      return `'${ESCAPE_ARRAY_JSON(String(value))}'`;
    } else {
      if (String(value).startsWith("(SELECT")) return `${value}`;
        try {
            return value.includes("'") ? `'${ESCAPE_SIMPLE_QUOTE(value)}'` : `'${value}'`;
        } catch (error) {            
            return `'${value}'`;
        }
    }
  }
