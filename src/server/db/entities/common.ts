/**
 * Common class entity.
 *f
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Knex } from "knex";
import { createDbList, isGraph } from "../helpers";
import { getEntityName, isNull, returnFormats } from "../../helpers/index";
import { Logs } from "../../logger";
import { Ientity, IreturnResult } from "../../types";
import { createDbGraph, knexQueryToSqlString, removeKeyFromUrl, verifyId } from "../helpers";
import { CONFIGURATION } from "../../configuration";
import { IGraphDatas } from "../helpers/createDbGraph";
import { messages } from "../../messages/";

export class Common {
    readonly ctx: koa.Context;
    static dbContext: Knex | Knex.Transaction;
    public nextLinkBase: string;
    public linkBase: string;
    public DBST: { [key: string]: Ientity; };

    constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
        Logs.class(this.constructor.name, messages.infos.constructor);
        this.ctx = ctx;
        if (knexInstance) Common.dbContext = knexInstance;
        this.nextLinkBase = removeKeyFromUrl(`${this.ctx._odata.options.rootBase}${this.ctx.href.split(`${ctx._version}/`)[1]}`, ["top", "skip"]);
        this.linkBase = `${this.ctx._odata.options.rootBase}${this.constructor.name}`; 
        this.DBST = createDbList(CONFIGURATION.dbEntities[this.ctx._configName]);
    }

    // only for override
    formatDataInput(input: object | undefined): object | undefined {
        return input;
    }

    // Log full Query
    logQuery(input: Knex.QueryBuilder | string): void {
        const queryString = typeof input === "string" ? input : knexQueryToSqlString(input);
        Logs.query(`\n${queryString}`);
    }

    // create a blank ReturnResult
    createReturnResult(args: Record<string, unknown>): IreturnResult {
        Logs.class(this.constructor.name, "createReturnResult");
        return {
            ...{
                id: undefined,
                nextLink: args.nextLink ? (args.nextLink as string) : undefined,
                prevLink: args.prevLink ? (args.prevLink as string) : undefined,
                body: undefined,
                total: undefined
            },
            ...args
        };
    }

    // create the nextLink
    nextLink = (resLength: number): string | undefined => {
        if (this.ctx._odata.limit < 1) return;       
        const max: number = this.ctx._odata.limit > 0 ? +this.ctx._odata.limit : +CONFIGURATION.list[this.ctx._configName].nb_page;
        if (resLength >= max) return `${encodeURI(this.nextLinkBase)}${this.nextLinkBase.includes("?") ? "&" : "?"}$top=${this.ctx._odata.limit}&$skip=${this.ctx._odata.skip + this.ctx._odata.limit}`;
    };
    
    // create the prevLink
    prevLink = (resLength: number): string | undefined => {
        if (this.ctx._odata.limit < 1) return;
        const prev = this.ctx._odata.skip - this.ctx._odata.limit;
        if ((CONFIGURATION.list[this.ctx._configName].nb_page && resLength >= +CONFIGURATION.list[this.ctx._configName].nb_page || this.ctx._odata.limit) && prev >= 0)
            return `${encodeURI(this.nextLinkBase)}${this.nextLinkBase.includes("?") ? "&" : "?"}$top=${this.ctx._odata.limit}&$skip=${prev}`;
    };

    // formatResult for graph and for observation request without Datastreams or MultiDatastreams
    formatResult = async (input: JSON): Promise<JSON | IGraphDatas> => {
        Logs.debug("formatResult", this.ctx._odata.resultFormat);
        if (isGraph(this.ctx._odata)) {            
            const entityName = getEntityName(this.ctx._odata.parentEntity ? this.ctx._odata.parentEntity : this.ctx._odata.entity);            
            const tempTitle = (entityName && this.DBST[entityName].columns["name"]) 
                                ? await Common.dbContext.raw(`SELECT "name" FROM "${this.DBST[entityName].table}" WHERE id = ${this.ctx._odata.parentEntity ? this.ctx._odata.parentId: this.ctx._odata.id} LIMIT 1`).then((res: object) => res["rows"][0].name)
                                : "No Title";
            const temp = createDbGraph(input, tempTitle);
            return temp ? temp : JSON.parse('');
        }
        return input;
    };

    async getAll(): Promise<IreturnResult | undefined> {
        Logs.class(this.constructor.name, `getAll in ${this.ctx._odata.resultFormat} format`);
        // create query
        const sql = this.ctx._odata.asGetSql();

        if (isNull(sql)) return;

        this.logQuery(sql);

        if (this.ctx._odata.resultFormat === returnFormats.sql) return this.createReturnResult({ body: sql });

        // build return result
        return await Common.dbContext
            .raw(sql)
            .then(async (res: object) => {   
                const nb = Number(res["rows"][0].count);
                if (nb > 0 && res["rows"][0]) {                    
                    return this.createReturnResult({
                        id: isNaN(nb) ? undefined : nb,
                        nextLink: this.nextLink(nb),
                        prevLink: this.prevLink(nb),
                        body: await this.formatResult(res["rows"][0].results)
                    });
                } else return this.createReturnResult({ 
                        body: res["rows"][0].results || res["rows"][0]
                    });
            })
            .catch((err: Error) => this.ctx.throw(400, { code: 400,detail: err.message }));
    }

    async getSingle(idInput: bigint | string): Promise<IreturnResult | undefined> {
        Logs.class(this.constructor.name, `getSingle [${idInput}]`);
        // create query
        const sql = this.ctx._odata.asGetSql();

        if (isNull(sql)) return;
        
        this.logQuery(sql);
        
        if (this.ctx._odata.resultFormat === returnFormats.sql) return this.createReturnResult({ body: sql });
        
        // build return result
        return await Common.dbContext
        .raw(sql)
        .then((res: object) => {
                if (this.ctx._odata.select && this.ctx._odata.onlyValue) 
                    return this.createReturnResult({ body: String(res["rows"][0][this.ctx._odata.select == "id" ? "@iot.id" : this.ctx._odata.select ]) });
                
                const nb = Number(res["rows"][0].count);
                if (nb > 0 && res["rows"][0].results[0]) {
                    return this.createReturnResult({
                        id: nb,
                        nextLink: this.nextLink(nb),
                        prevLink: this.prevLink(nb),
                        body: res["rows"][0].results[0]
                    });
                }
            })
            .catch((err: Error) => this.ctx.throw(400, { code: 400, detail: err.message }));
    }

    async add(dataInput: object | undefined): Promise<IreturnResult | undefined> {        
        Logs.class(this.constructor.name, "add");
        
        dataInput = this.formatDataInput(dataInput);
        
        if (!dataInput) return;
        // create query
        const sql = this.ctx._odata.asPostSql(dataInput, Common.dbContext);

        this.logQuery(sql);

        if (this.ctx._odata.resultFormat === returnFormats.sql) return this.createReturnResult({ body: sql });
        // build return result
        return await Common.dbContext
            .raw(sql)
            .then((res: object) => {                     
                if (res["rows"]) {
                    if (res["rows"][0].duplicate) this.ctx.throw(409, { code: 409, detail: `${this.constructor.name} already exist`, link: `${this.linkBase}(${[res["rows"][0].duplicate]})` });
                    if (res["rows"][0].results[0]) this.formatResult(res["rows"][0].results[0]);
                    return this.createReturnResult({
                        body: res["rows"][0].results[0],
                        query: sql
                    });
                }
            })
            .catch((err: Error) => {          
                this.ctx.throw(400, { code: 400, detail: err["detail"] });
            });
    }

    async update(idInput: bigint | string, dataInput: object | undefined): Promise<IreturnResult | undefined> {
        Logs.class(this.constructor.name, "update");

        // if (!dataInput) this.ctx.throw(400, { code: 400, detail: messages.errors.noDataSend + "update" });

        const testIfId = await verifyId(Common.dbContext, BigInt(idInput), this.DBST[this.constructor.name].table);

        if (testIfId === false) this.ctx.throw(404, { code: 404, detail: messages.errors.noId + idInput });

        dataInput = this.formatDataInput(dataInput);
        if (!dataInput) return;
        // create query
        const sql = this.ctx._odata.asPatchSql(dataInput, Common.dbContext);

        this.logQuery(sql);

        if (this.ctx._odata.resultFormat === returnFormats.sql) return this.createReturnResult({ body: sql });

        // build return result
        return await Common.dbContext
            .raw(sql)
            .then((res: object) => {
                if (res["rows"]) {
                    if (res["rows"][0].results[0]) this.formatResult(res["rows"][0].results[0]);
                    return this.createReturnResult({ body: res["rows"][0].results[0], query: sql });
                }
            })
            .catch((err: Error) => {
                this.ctx.throw(400, { code: 400, detail: err["detail"] });
            });
    }

    async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
        Logs.class(this.constructor.name, "delete");
        // create query
        const sql = `DELETE FROM "${this.DBST[this.constructor.name].table}" WHERE id = ${idInput} RETURNING id`;
        // build return result
        return this.createReturnResult((this.ctx._odata.resultFormat === returnFormats.sql)  
                ? { id: BigInt(idInput), body: sql }
                : { id:  await Common.dbContext.raw(sql).then((res) => BigInt(res["rows"][0].id)).catch(() => BigInt(0))});
     }
}
