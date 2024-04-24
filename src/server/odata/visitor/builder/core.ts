/**
 * core builder
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _COLUMNSEPARATOR } from "../../../constants";

export class Core {
  private _src: string;
  
  constructor(input?: string) {
    this._src = input || "";
  }
  
  add(input: string) {
    this._src += input;
  }

  init(input: string) {
    this._src = input;
  }
  
  toString() {    
    return this._src;
  }

  notNull() {    
    return this._src.trim() !== "";
  }

  replace(from: any, to: any) {
    this._src = this._src.replace(from, to);
  }

}
