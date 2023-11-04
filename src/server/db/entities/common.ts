/**
 * Common class entity.
 *f
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

 import koa from "koa";
 import { isNull, returnFormats } from "../../helpers/index";
 import { Logs } from "../../logger";
 import { Ientity, IreturnResult } from "../../types";
 import { executeSql, removeKeyFromUrl, verifyId } from "../helpers";
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
    //  this.ctx._config.name = serverConfig.db(ctx._config.name);
     this.nextLinkBase = removeKeyFromUrl(
       `${this.ctx._odata.options.rootBase}${
         this.ctx.href.split(`${ctx._config.apiVersion}/`)[1]
       }`,
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
 
   // only for override
   formatString(input: string): string {
     return input.replace(/\s+/g, " ").trim();
   }
 
   formatDataInput(input: object | undefined): object | undefined {
     // if (input) {
     //     input["name"] = this.formatString(input["name"]);
     //     input["description"] = this.formatString(input["description"]);
     // }
     // console.log(input);
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
         : this.ctx._config.nb_page;
     if (resLength >= max)
       return `${encodeURI(this.nextLinkBase)}${
         this.nextLinkBase.includes("?") ? "&" : "?"
       }$top=${this.ctx._odata.limit}&$skip=${
         this.ctx._odata.skip + this.ctx._odata.limit
       }`;
   };
 
   // create the prevLink
   prevLink = (resLength: number): string | undefined => {
     if (this.ctx._odata.limit < 1) return;
     const prev = this.ctx._odata.skip - this.ctx._odata.limit;
     if (
       ((this.ctx._config.nb_page && resLength >= this.ctx._config.nb_page) ||
         this.ctx._odata.limit) &&
       prev >= 0
     )
       return `${encodeURI(this.nextLinkBase)}${
         this.nextLinkBase.includes("?") ? "&" : "?"
       }$top=${this.ctx._odata.limit}&$skip=${prev}`;
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
       const tmp = await executeSql(this.ctx._config.name, sql);
       return this.createReturnResult({ body: tmp["rows"] });
     }
     // build return result
     return executeSql(this.ctx._config.name, sql)
       .then(async (res: object) => {
         const nb = Number(res["rows"][0].count);
         if (nb > 0 && res["rows"][0]) {
           return this.createReturnResult({
             id: isNaN(nb) ? undefined : nb,
             nextLink: this.nextLink(nb),
             prevLink: this.prevLink(nb),
             body: res["rows"][0].results,
           });
         } else
           return this.createReturnResult({
             body: res["rows"][0].results || res["rows"][0],
           });
       })
       .catch((err: Error) =>
         this.ctx.throw(400, { code: 400, detail: err.message })
       );
   }
 
   // Return one item
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   async getSingle( idInput: bigint | string ): Promise<IreturnResult | undefined> {
     Logs.whereIam();
     // create query
     const sql = this.ctx._odata.asGetSql();
 
     if (isNull(sql)) return;
 
     if (this.ctx._odata.resultFormat === returnFormats.sql)
       return this.createReturnResult({ body: sql });
 
     // build return result
     return executeSql(this.ctx._config.name, sql)
       .then((res: object) => {
         if (this.ctx._odata.select && this.ctx._odata.onlyValue)
           return this.createReturnResult({
             body: String(
               res["rows"][0][
                 this.ctx._odata.select == "id"
                   ? "@iot.id"
                   : this.ctx._odata.select
               ]
             ),
           });
 
         const nb = Number(res["rows"][0].count);
         if (nb > 0 && res["rows"][0].results[0]) {
           return this.createReturnResult({
             id: nb,
             nextLink: this.nextLink(nb),
             prevLink: this.prevLink(nb),
             body: res["rows"][0].results[0],
           });
         }
       })
       .catch((err: Error) =>
         this.ctx.throw(400, { code: 400, detail: err.message })
       );
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
     return await executeSql(this.ctx._config.name, sql)
       .then((res: object) => {
         if (res["rows"]) {
           if (res["rows"][0].duplicate)
             this.ctx.throw(409, {
               code: 409,
               detail: `${this.constructor.name} already exist`,
               link: `${this.linkBase}(${[res["rows"][0].duplicate]})`,
             });
           if (res["rows"][0].results[0]) res["rows"][0].results[0];
           return this.createReturnResult({
             body: res["rows"][0].results[0],
             query: sql,
           });
         }
       })
       .catch((err: Error) => {
         this.ctx.throw(400, { code: 400, detail: err["detail"] });
       });
   }
 
   // Update an item
   async update(
     idInput: bigint | string,
     dataInput: object | undefined
   ): Promise<IreturnResult | undefined> {
     Logs.whereIam();
     const testIfId = await verifyId( this.ctx._config.name, BigInt(idInput), this.DBST[this.constructor.name].table );
 
     if (testIfId === false)
       this.ctx.throw(404, { code: 404, detail: errors.noId + idInput });
 
     dataInput = this.formatDataInput(dataInput);
     if (!dataInput) return;
     // create query
     const sql = this.ctx._odata.asPatchSql(dataInput, this.ctx._config.name);
 
     if (this.ctx._odata.resultFormat === returnFormats.sql)
       return this.createReturnResult({ body: sql });
 
     // build return result
     return await executeSql(this.ctx._config.name, sql)
       .then((res: object) => {
         if (res["rows"]) {
           if (res["rows"][0].results[0]) res["rows"][0].results[0];
           return this.createReturnResult({
             body: res["rows"][0].results[0],
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
     // create query
     const sql = `DELETE FROM "${
       this.DBST[this.constructor.name].table
     }" WHERE id = ${idInput} RETURNING id`;
     // build return result
     return this.createReturnResult(
       this.ctx._odata.resultFormat === returnFormats.sql
         ? { id: BigInt(idInput), body: sql }
         : {
             id: await executeSql(this.ctx._config.name, sql)
               .then((res) => BigInt(res["rows"][0].id))
               .catch(() => BigInt(0)),
           }
     );
   }
 }
 