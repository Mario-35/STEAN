/**
 * Common class entity.
 *f
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

 import koa from "koa";
 import { addDoubleQuotes, asyncForEach, isNull, returnFormats } from "../../helpers/index";
 import { Logs } from "../../logger";
 import { Ientity, IreturnResult } from "../../types";
 import { executeSqlValues, removeKeyFromUrl, verifyId } from "../helpers";
 import { errors } from "../../messages/";
 import { _DBFILTERED } from "../constants";
 
 // Connon class
 export class Common {
   readonly ctx: koa.Context;
   public nextLinkBase: string;
   public linkBase: string;
   public DBST: { [key: string]: Ientity };
 
   constructor(ctx: koa.Context) {
     Logs.whereIam();
     this.ctx = ctx;
     this.nextLinkBase = removeKeyFromUrl(
       `${this.ctx._odata.options.rootBase}${ this.ctx.href.split(`${ctx._config.apiVersion}/`)[1] }`,
       ["top", "skip"]
     );
     this.linkBase = `${this.ctx._odata.options.rootBase}${this.constructor.name}`;
     this.DBST = _DBFILTERED(this.ctx);     
   }
 
   // Get a key value
   getKeyValue(input: object, key: string): string | undefined {
     let result: string | undefined = undefined;
     if (input[key]) {
       result = input[key]["@iot.id"] ? input[key]["@iot.id"] : input[key];
       delete input[key];
     }
     return result;
   }
   // Get a list of key values
   getKeysValue(input: object, keys: string[]): string | undefined {
     keys.forEach((key) => {
       const temp = this.getKeyValue(input, key);
       if (temp) return temp;
     });
     return undefined;
   }

   formatDataInput(input: object | undefined): object | undefined {
     return input;
   }
 
   // create a blank ReturnResult
   createReturnResult(args: Record<string, unknown>): IreturnResult {
     Logs.whereIam();
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
 
   // create the nextLink
   nextLink = (resLength: number): string | undefined => {
     if (this.ctx._odata.limit < 1) return;
     const max: number =
       this.ctx._odata.limit > 0
         ? +this.ctx._odata.limit
         : +this.ctx._config.nb_page;
     if (resLength >= max)
       return `${encodeURI(this.nextLinkBase)}${ this.nextLinkBase.includes("?") ? "&" : "?" }$top=${this.ctx._odata.limit}&$skip=${ this.ctx._odata.skip + this.ctx._odata.limit }`;
   };
 
   // create the prevLink
   prevLink = (resLength: number): string | undefined => {
     if (this.ctx._odata.limit < 1) return;
     const prev = this.ctx._odata.skip - this.ctx._odata.limit;
     if ( ((this.ctx._config.nb_page && resLength >= this.ctx._config.nb_page) || this.ctx._odata.limit) && prev >= 0 )
       return `${encodeURI(this.nextLinkBase)}${ this.nextLinkBase.includes("?") ? "&" : "?" }$top=${this.ctx._odata.limit}&$skip=${prev}`;
   };
 
   // Return all items
   async getAll(): Promise<IreturnResult | undefined> {
     Logs.whereIam();
     // create query
     const sql = this.ctx._odata.asGetSql();
 
     if (isNull(sql)) return;
 
     if (this.ctx._odata.resultFormat === returnFormats.sql)
       return this.createReturnResult({ body: sql });
     if (this.ctx._odata.resultFormat === returnFormats.graph) {
       const tmp = await executeSqlValues(this.ctx._config.name, sql);       
       return this.createReturnResult({ body: tmp[0]});
     }

    return await executeSqlValues(this.ctx._config.name, sql)   
       .then(async (res: object) => { 
         return (res[0] > 0) ? 
            this.createReturnResult({
              id: isNaN(res[0][0]) ? undefined : +res[0],
              nextLink: this.nextLink(res[0]),
              prevLink: this.prevLink(res[0]),
              body: res[1],
            }) : this.createReturnResult({ body: res[0] == 0 ? [] : res[0]});
       })
       .catch((err: Error) =>
         this.ctx.throw(400, { code: 400, detail: err.message })
       );
   }
 
   // Return one item
   async getSingle(_idInput: bigint | string): Promise<IreturnResult | undefined> {
    Logs.whereIam();
    // create query
    const sql = this.ctx._odata.asGetSql();

    if (isNull(sql)) return;

    if (this.ctx._odata.resultFormat === returnFormats.sql)
      return this.createReturnResult({ body: sql });

    // build return result
    return await executeSqlValues(this.ctx._config.name, sql) 
      .then((res: object) => {           
        if (this.ctx._odata.select && this.ctx._odata.onlyValue)
          return this.createReturnResult({
            body: String(res[ this.ctx._odata.select == "id" ? "@iot.id" : 0 ]),
          });

        if (res[0] > 0) {          
          return this.createReturnResult({
            id: +res[0],
            nextLink: this.nextLink(res[0]),
            prevLink: this.prevLink(res[0]),
            body: res[1][0],
          });
        }
      })
      .catch((err: Error) =>
        this.ctx.throw(400, { code: 400, detail: err })
      );
  }

  async addWultipleLines(dataInput: object | undefined): Promise<IreturnResult | undefined> {
    Logs.whereIam();
    const results:object[] = [];
    await asyncForEach(Object(dataInput), async (datas: object) => {
      const modifiedDatas = this.formatDataInput(datas);
       if (modifiedDatas) {
         const sql = this.ctx._odata.asPostSql(modifiedDatas, this.ctx._config.name);             
         await executeSqlValues(this.ctx._config.name, sql)
          .then((res: object) => results.push(res[0][0]) )
          .catch((err: Error) => {        
            this.ctx.throw(400, { code: 400, detail: err["detail"] });
          });
       }  
    });
    return this.createReturnResult({
      body: results,
    });
  }
   // Post an item
   async add(dataInput: object | undefined): Promise<IreturnResult | undefined> {
    Logs.whereIam();      
     dataInput = this.formatDataInput(dataInput);
 
     if (!dataInput) return;
     // create query
     const sql = this.ctx._odata.asPostSql(dataInput, this.ctx._config.name);
 
     if (this.ctx._odata.resultFormat === returnFormats.sql)
       return this.createReturnResult({ body: sql });
     // build return result
     return await executeSqlValues(this.ctx._config.name, sql) 
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
        console.log(err);
            
         this.ctx.throw(400, { code: 400, detail: err.message });
       });
   }
 
   // Update an item
   async update( idInput: bigint | string, dataInput: object | undefined ): Promise<IreturnResult | undefined> {
     Logs.whereIam();
     const testIfId = await verifyId( this.ctx._config.name, BigInt(idInput), this.DBST[this.constructor.name].table );
 
     if (testIfId === false)
       this.ctx.throw(404, { code: 404, detail: errors.noId + idInput });
 
     dataInput = this.formatDataInput(dataInput);
     if (!dataInput) return;
     const sql = this.ctx._odata.asPatchSql(dataInput, this.ctx._config.name);
     if (this.ctx._odata.resultFormat === returnFormats.sql)
       return this.createReturnResult({ body: sql });

       return await executeSqlValues(this.ctx._config.name, sql) 
       .then((res: object) => {    
         if (res[0]) {
           return this.createReturnResult({
             body: res[0][0],
             query: sql,
           });
         }
       })
       .catch((err: Error) => {        
         this.ctx.throw(400, { code: 400, detail: err["detail"] });
       });
   }
 
   // Delete an item
   async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
     Logs.whereIam();
     const sql = `DELETE FROM ${addDoubleQuotes(this.DBST[this.constructor.name].table)} WHERE "id" = ${idInput} RETURNING id`;
     return this.createReturnResult(
       this.ctx._odata.resultFormat === returnFormats.sql
         ? { id: BigInt(idInput), body: sql }
         : {
             id: await executeSqlValues(this.ctx._config.name, sql) 
               .then((res) => res[0])
               .catch(() => BigInt(0)),
           }
     );
   }
 }
 