/**
 * Visitor for odata.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { SqlOptions } from "../../parser/sqlOptions";
import koa from "koa";
import { _COLUMNSEPARATOR } from "../../../constants";
import { IreturnFormat } from "../../../types";
import { returnFormats } from "../../../helpers";
import { PgVisitor } from "..";
import { Query } from "./query";

export class Visitor {
  public ctx: koa.Context;
  public options: SqlOptions;
  onlyRef = false;
  onlyValue = false;
  valueskeys = false;
  resultFormat: IreturnFormat = returnFormats.json;
  query: Query;
  includes: PgVisitor[] = [];
  constructor(ctx: koa.Context, options = <SqlOptions>{}) {
    this.ctx = ctx;
    this.options = options;
    this.onlyRef = options.onlyRef;
    this.onlyValue = options.onlyValue;
    this.valueskeys = options.valueskeys;
    this.resultFormat =  (options.onlyValue === true) ? returnFormats.txt : returnFormats.json;  
    this.query = new Query();
  }

  addInclde(input: PgVisitor) {
    this.includes.push(input)
  }

}
