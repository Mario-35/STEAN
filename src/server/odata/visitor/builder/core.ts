/**
 * core builder
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _COLUMNSEPARATOR } from "../../../constants";
import { formatLog } from "../../../logger";

export class core {
  private _src: string;
  
  constructor(input: string) {
    console.log(formatLog.whereIam());
    this._src = input;
  }

  add(input: string) {
    console.log(formatLog.whereIam());
    this._src += input;
  }

  init(input: string) {
    console.log(formatLog.whereIam());
    this._src = input;
  }
  
  toString() {
    console.log(formatLog.whereIam());    
    return this._src;
  }

  notNull() {
    console.log(formatLog.whereIam());    
    return this._src.trim() !== "";
  }

}
