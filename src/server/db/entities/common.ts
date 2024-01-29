/**
 * Common class entity.
 *f
 * @copyright 2020-present Inrae
 * @review 29-01-2024
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { addDoubleQuotes, returnFormats } from "../../helpers/index";
import { formatLog } from "../../logger";
import { IreturnResult } from "../../types";
import { executeSqlValues, removeKeyFromUrl } from "../helpers";
import { getErrorCode } from "../../messages";
import { versionString } from "../../constants";
 // Common class
export class Common {
  readonly ctx: koa.Context;
  public nextLinkBase: string;
  public linkBase: string;

  constructor(ctx: koa.Context) {
    console.log(formatLog.whereIam());
    this.ctx = ctx;
    this.nextLinkBase = removeKeyFromUrl( `${this.ctx._odata.options.rootBase}${ this.ctx.href.split(`${versionString(ctx._config.apiVersion)}/`)[1] }`, ["top", "skip"] );
    this.linkBase = `${this.ctx._odata.options.rootBase}${this.constructor.name}`;     
  }

  // Get a key value
  private getKeyValue(input: object, key: string): string | undefined {
    let result: string | undefined = undefined;
    if (input[key]) {
      result = input[key]["@iot.id"] ? input[key]["@iot.id"] : input[key];
      delete input[key];
    }
    return result;
  }
  // Get a list of key values
  public getKeysValue(input: object, keys: string[]): string | undefined {
    keys.forEach((key) => {
      const temp = this.getKeyValue(input, key);
      if (temp) return temp;
    });
    return undefined;
  }

  // Only for override
  formatDataInput(input: object | undefined): object | undefined {
    return input;
  }

  // create a blank ReturnResult
  public createReturnResult(args: Record<string, unknown>): IreturnResult {
    console.log(formatLog.whereIam());
    return {
      ...{
        id: undefined,
        nextLink: args.nextLink ? (args.nextLink as string) : undefined,
        prevLink: args.prevLink ? (args.prevLink as string) : undefined,
        body: undefined,
        total: undefined,
      },
      ...args,
    };
  }

  // Create the nextLink
  public nextLink = (resLength: number): string | undefined => {
    if (this.ctx._odata.limit < 1) return;
    const max: number =
      this.ctx._odata.limit > 0
        ? +this.ctx._odata.limit
        : +this.ctx._config.nb_page;
    if (resLength >= max) return `${encodeURI(this.nextLinkBase)}${ this.nextLinkBase.includes("?") ? "&" : "?" }$top=${this.ctx._odata.limit}&$skip=${ this.ctx._odata.skip + this.ctx._odata.limit }`;
  };

  // Create the prevLink
  public prevLink = (resLength: number): string | undefined => {
    if (this.ctx._odata.limit < 1) return;
    const prev = this.ctx._odata.skip - this.ctx._odata.limit;
    if ( ((this.ctx._config.nb_page && resLength >= this.ctx._config.nb_page) || this.ctx._odata.limit) && prev >= 0 )
      return `${encodeURI(this.nextLinkBase)}${ this.nextLinkBase.includes("?") ? "&" : "?" }$top=${this.ctx._odata.limit}&$skip=${prev}`;
  };

  // Return all items
  async getAll(): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    const sql = this.ctx._odata.createGetSql();

    if (!sql) return;

    if (this.ctx._odata.resultFormat === returnFormats.sql) return this.createReturnResult({ body: sql });
    if (this.ctx._odata.resultFormat === returnFormats.graph) {
      const tmp = await executeSqlValues(this.ctx._config, sql);       
      return this.createReturnResult({ body: tmp[0]});
    }

    return await executeSqlValues(this.ctx._config, sql).then(async (res: object) => { 
      return (res[0] > 0) ? 
        this.createReturnResult({
          id: isNaN(res[0][0]) ? undefined : +res[0],
          nextLink: this.nextLink(res[0]),
          prevLink: this.prevLink(res[0]),
          body: res[1],
        }) : this.createReturnResult({ body: res[0] == 0 ? [] : res[0]});
    }).catch((err: Error) => this.ctx.throw(400, { code: 400, detail: err.message }) );
  }

  // Return one item
  async getSingle(_idInput: bigint | string): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    // create query
    const sql = this.ctx._odata.createGetSql();

    if (!sql) return;

    if (this.ctx._odata.resultFormat === returnFormats.sql)
      return this.createReturnResult({ body: sql });

    // build return result
    return await executeSqlValues(this.ctx._config, sql).then((res: object) => {           
      if (this.ctx._odata.select && this.ctx._odata.onlyValue) return this.createReturnResult({ body: String(res[ this.ctx._odata.select[0] == "id" ? "@iot.id" : 0 ]), });
      if (res[0] > 0) return this.createReturnResult({ id: +res[0], nextLink: this.nextLink(res[0]), prevLink: this.prevLink(res[0]), body: res[1][0], });
    }).catch((err: Error) => this.ctx.throw(400, { code: 400, detail: err }) );
  }

  async addWultipleLines(dataInput: object | undefined): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (this.ctx._log) this.ctx._log.datas = {datas: "Multilines not saved in logs"};
    const sqls:string[] = Object(dataInput).map((datas: object) => {
      const modifiedDatas = this.formatDataInput(datas);
      if (modifiedDatas && this.ctx._odata.createPostSql) {
        const sql = this.ctx._odata.createPostSql(modifiedDatas);
        if (sql) return sql;
      }
    });
    const results:object[] = [];
    await executeSqlValues(this.ctx._config, sqls.join(";")).then((res: object) => results.push(res[0]) )
        .catch((err: Error) => { 
          console.log(err);      
          this.ctx.throw(400, { code: 400, detail: err["detail"] });
        });
    return this.createReturnResult({
      body: results,
    });
  }

  // Post an item
  async post(dataInput: object | undefined): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    dataInput = this.formatDataInput(dataInput);
    if (!dataInput) return;
    // create query
    const sql = this.ctx._odata.createPostSql(dataInput);
    if (!sql) return;
    if (this.ctx._odata.resultFormat === returnFormats.sql)
      return this.createReturnResult({ body: sql });
    // build return result
    return await executeSqlValues(this.ctx._config, sql) 
      .then((res: object) => {    
        if (res[0]) {
          if (res[0].duplicate)
            this.ctx.throw(409, {
              code: 409,
              detail: `${this.constructor.name} already exist`,
              link: `${this.linkBase}(${[res[0].duplicate]})`,
            });
          return this.createReturnResult({
            body: res[0][0],
            query: sql,
          });
        }
      })
      .catch((err: Error) => {    
        const code = getErrorCode(err, 400);     
        this.ctx.throw(code, { code: code, detail: err.message });
      });
  }

  // Update an item
  async update( idInput: bigint | string, dataInput: object | undefined ): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam()); 
    dataInput = this.formatDataInput(dataInput);
    if (!dataInput) return;
    const sql = this.ctx._odata.createPatchSql(dataInput);
    if (!sql) return;
    if (this.ctx._odata.resultFormat === returnFormats.sql)
      return this.createReturnResult({ body: sql });

      return await executeSqlValues(this.ctx._config, sql) 
      .then((res: object) => {    
        if (res[0]) {
          return this.createReturnResult({
            body: res[0][0],
            query: sql,
          });
        }
      })
      .catch((err: Error) => {
      const code = getErrorCode(err, 400);     
      this.ctx.throw(code, { code: code, detail: err.message });
      });
  }

  // Delete an item
  async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    const sql = `DELETE FROM ${addDoubleQuotes(this.ctx._model[this.constructor.name].table)} WHERE "id" = ${idInput} RETURNING id`;
    return this.createReturnResult(
      this.ctx._odata.resultFormat === returnFormats.sql
        ? { id: BigInt(idInput), body: sql }
        : { id: await executeSqlValues(this.ctx._config, sql) .then((res) => res[0]) .catch(() => BigInt(0)), }
    );
  }
}
 