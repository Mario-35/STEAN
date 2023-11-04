/**
 * formatColumnValue.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/

import { _DB } from "../constants";
function isObject(value: unknown) {
    return typeof value === 'object' && value !== null;
  }

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
      return `'${JSON.stringify(value).replace(/'/g, "\''")}'`;
    } else {
        try {
            return value.includes("'") ? `'${value.replace(/'/g, "\\'")}'` : `'${value}'`;
        } catch (error) {            
            return `'${value}'`;
        }
    }
  }
