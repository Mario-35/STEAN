/**
 * Api dataAccess.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import * as entities from "../entities/index";
import { Common } from "../entities/common";
import koa from "koa";
import { Logs } from "../../logger";
import { IreturnResult } from "../../types";
import { recordToKeyValue } from "../helpers";
import { getEntityName } from "../../helpers";
import { db } from "..";
import { messages } from "../../messages";

export class apiAccess {
    readonly myEntity: Common | undefined;
    readonly ctx: koa.Context;

    constructor(ctx: koa.Context) {
        this.ctx = ctx;     
        const entityName = getEntityName(this.ctx._odata.entity);
        if (entityName && entityName in entities) {
            this.myEntity = new entities[(this.ctx, entityName)](ctx, db[this.ctx._configName]);
            if (this.myEntity === undefined) Logs.error(`${messages.errors.entity} : ${entityName}`);
            else Logs.class("constructor apiAccess", "Ok");
        } else Logs.error(`${messages.errors.entity} : ${entityName}`);
    }

    formatDataInput(input: object | undefined): object | undefined {
        Logs.class(this.constructor.name, "formatDataInput");
        return this.myEntity ? this.myEntity.formatDataInput(input) : input;
    }

    async getAll(): Promise<IreturnResult | undefined> {
        Logs.class(this.constructor.name, "getAll");
        if (this.myEntity) return await this.myEntity.getAll();
    }

    async getSingle(idInput: bigint | string, propertyName?: string, onlyValue?: boolean): Promise<IreturnResult | undefined> {
        Logs.class(this.constructor.name, "getSingle");
        if (this.myEntity) return await this.myEntity.getSingle(idInput);
    }

    async add(): Promise<IreturnResult | undefined> {
        Logs.class(this.constructor.name, "add");
        if (this.myEntity) return await this.myEntity.add(recordToKeyValue(this.ctx.request.body));
    }

    async update(idInput: bigint | string): Promise<IreturnResult | undefined> {
        Logs.class(this.constructor.name, "update");
        if (this.myEntity) return await this.myEntity.update(idInput, recordToKeyValue(this.ctx.request.body));
    }

    async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
        Logs.class(this.constructor.name, "delete");
        if (this.myEntity) return await this.myEntity.delete(idInput);
    }
}
