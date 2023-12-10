/**
 * formatColumnValue.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/

import { ESCAPE_ARRAY_JSON, ESCAPE_SIMPLE_QUOTE } from "../../constants";
import { addSimpleQuotes, isObject } from "../../helpers";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatColumnValue(value: any, type: string): string | undefined {
  if (value) switch (value) {
    case void 0:
      return '';
    case null:
      return 'null';
      case value.isRawInstance:
        return value.toQuery();
    default:
      switch (type) {
        case 'number':
          return value;
        case 'bool':
          if (value === 'false') value = 0;
          return `'${value ? 1 : 0}'`;
        case 'json':
        case 'jsonb':
          if (isObject(value)) return addSimpleQuotes(ESCAPE_SIMPLE_QUOTE(JSON.stringify(value)));
          return "JSON ERROR";
        case 'text[]':
          const temp = ESCAPE_ARRAY_JSON(String(value));
          if(temp) return addSimpleQuotes(temp);
          return "ARRAY ERROR";
        default:
          break;
      }
      if (String(value).startsWith("(SELECT")) return `${value}`;
      try {
          return value.includes("'") ? addSimpleQuotes(ESCAPE_SIMPLE_QUOTE(value)): addSimpleQuotes(value);
      } catch (error) {            
          return addSimpleQuotes(value);
      }
  }
}
