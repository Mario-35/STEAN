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
import { getErrorCode, infos } from "../../messages";
import { versionString } from "../../constants";
import { log } from "../../log";
 // Common class
export class Common {
  readonly ctx: koa.Context;
  public nextLinkBase: string;
  public linkBase: string;

  constructor(ctx: koa.Context) {
    console.log(formatLog.whereIam());
    this.ctx = ctx;
    this.nextLinkBase = removeKeyFromUrl( `${this.ctx.decodedUrl.root}/${ this.ctx.href.split(`${versionString(ctx.config.apiVersion)}/`)[1] }`, ["top", "skip"] );
    this.linkBase = `${this.ctx.decodedUrl.root}/${this.constructor.name}`;     
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
    if (this.ctx.odata.limit < 1) return;
    const max: number =
      this.ctx.odata.limit > 0
        ? +this.ctx.odata.limit
        : +this.ctx.config.nb_page;
    if (resLength >= max) return `${encodeURI(this.nextLinkBase)}${ this.nextLinkBase.includes("?") ? "&" : "?" }$top=${this.ctx.odata.limit}&$skip=${ this.ctx.odata.skip + this.ctx.odata.limit }`;
  };

  // Create the prevLink
  public prevLink = (resLength: number): string | undefined => {
    if (this.ctx.odata.limit < 1) return;
    const prev = this.ctx.odata.skip - this.ctx.odata.limit;
    if ( ((this.ctx.config.nb_page && resLength >= this.ctx.config.nb_page) || this.ctx.odata.limit) && prev >= 0 )
      return `${encodeURI(this.nextLinkBase)}${ this.nextLinkBase.includes("?") ? "&" : "?" }$top=${this.ctx.odata.limit}&$skip=${prev}`;
  };

  // Return all items
  async getAll(): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    // create query
    const sql = this.ctx.odata.createGetSql();
    
    // Return results
    if (sql) switch (this.ctx.odata.resultFormat ) {
      case returnFormats.sql:
        return this.createReturnResult({ body: sql });

      case returnFormats.graph:
        return await executeSqlValues(this.ctx.config, sql).then(async (res: object) => { 
          return (res[0] > 0)  ?  this.createReturnResult({ body: res[0]}) : this.createReturnResult({ body: "nothing"});
        });  
        // const tmp = await executeSqlValues(this.ctx.config, sql);       
        // return this.createReturnResult({ body: tmp[0]});

      default:        
        return await executeSqlValues(this.ctx.config, sql).then(async (res: object) => { 
          return (res[0] > 0) ? 
            this.createReturnResult({
              id: isNaN(res[0][0]) ? undefined : +res[0],
              nextLink: this.nextLink(res[0]),
              prevLink: this.prevLink(res[0]),
              body: res[1],
            }) : this.createReturnResult({ body: res[0] == 0 ? [] : res[0]});
        }).catch((err: Error) => this.ctx.throw(400, { code: 400, detail: err.message }) );
    }
  }

  // Return one item
  async getSingle(_idInput: bigint | string): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    // create query
    const sql = this.ctx.odata.createGetSql();
    // Return results
    if (sql) switch (this.ctx.odata.resultFormat ) {
      case returnFormats.sql:
        return this.createReturnResult({ body: sql });

      default:
        return await executeSqlValues(this.ctx.config, sql).then((res: object) => {           
          if (this.ctx.odata.select && this.ctx.odata.onlyValue  === true) return this.createReturnResult({ body: String(res[ this.ctx.odata.select[0] == "id" ? "@iot.id" : 0 ]), });
          if (res[0] > 0) return this.createReturnResult({ id: +res[0], nextLink: this.nextLink(res[0]), prevLink: this.prevLink(res[0]), body: res[1][0], });
        }).catch((err: Error) => this.ctx.throw(400, { code: 400, detail: err }) );
    }
  }
  // Execute multilines SQL in one query
  async addWultipleLines(dataInput: object | undefined): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    // stop save to log cause if datainput too big 
    if (this.ctx.log) this.ctx.log.datas = {datas: infos.MultilinesNotSaved};
    // create queries
    const sqls:string[] = Object(dataInput).map((datas: object) => {
      const modifiedDatas = this.formatDataInput(datas);
      if (modifiedDatas && this.ctx.odata.createPostSql) {
        const sql = this.ctx.odata.createPostSql(modifiedDatas);
        if (sql) return sql;
      }
    });
    // return results object
    const results:object[] = [];
    // execute query
    await executeSqlValues(this.ctx.config, sqls.join(";")).then((res: object) => results.push(res[0]) )
        .catch((err: Error) => { 
          log.error(formatLog.error(err));   
          this.ctx.throw(400, { code: 400, detail: err["detail"] });
        });
    // Return results
    return this.createReturnResult({
      body: results,
    });
  }

  // Post an item
  async post(dataInput: object | undefined): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    // Format datas
    dataInput = this.formatDataInput(dataInput);
    if (!dataInput) return;
    // create query
    const sql = this.ctx.odata.createPostSql(dataInput);
    // Return results
    if (sql) switch (this.ctx.odata.resultFormat ) {
      case returnFormats.sql:
        return this.createReturnResult({ body: sql });

      default:
        return await executeSqlValues(this.ctx.config, sql) 
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
  }

  // Update an item
  async update( idInput: bigint | string, dataInput: object | undefined ): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam()); 
    // Format datas
    dataInput = this.formatDataInput(dataInput);
    if (!dataInput) return;
    // create Query
    const sql = this.ctx.odata.createPatchSql(dataInput);
    // Return results
    if (sql) switch (this.ctx.odata.resultFormat ) {
      case returnFormats.sql:
        return this.createReturnResult({ body: sql });
        
      default:
        return await executeSqlValues(this.ctx.config, sql) 
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
  }

  // Delete an item
  async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    // create Query
    const sql = `DELETE FROM ${addDoubleQuotes(this.ctx.model[this.constructor.name].table)} WHERE "id" = ${idInput} RETURNING id`;
    // Return results
    if (sql) switch (this.ctx.odata.resultFormat ) {
      case returnFormats.sql:
        return this.createReturnResult({ body: sql });  
         
      default:
        return this.createReturnResult( { id: await executeSqlValues(this.ctx.config, sql) .then((res) => res[0]) .catch(() => BigInt(0)) } );
    }
  }
}
 