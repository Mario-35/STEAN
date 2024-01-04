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
import { formatLog } from "../../logger";
import { Icomon, IreturnResult } from "../../types";
import { isObjectArray } from "../../helpers";
import { models } from "../../models";


// Interface API
export class apiAccess implements Icomon {
  readonly myEntity: Common | undefined;
  readonly ctx: koa.Context;

  constructor(ctx: koa.Context) {
    this.ctx = ctx;
    const entityName = models.getEntityName(this.ctx._config, this.ctx._odata.entity);
    if (entityName && entityName in entities) {
      this.myEntity = new entities[(this.ctx, entityName)](ctx);
    } 
  }

  formatDataInput(input: object | undefined): object | undefined {
    console.log(formatLog.whereIam());
    return this.myEntity ? this.myEntity.formatDataInput(input) : input;
  }

  async getAll(): Promise<IreturnResult | undefined> {    
    console.log(formatLog.whereIam());
    if (this.myEntity) return await this.myEntity.getAll();
  }

  async getSingle( idInput: bigint | string ): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (this.myEntity) return await this.myEntity.getSingle(idInput);
  }

  async post(): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (this.myEntity) 
      return isObjectArray(this.ctx.request.body)
      ? await this.myEntity.addWultipleLines(this.ctx.request.body)
      : await this.myEntity.post(this.ctx.request.body);
  }

  async update(idInput: bigint | string): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (this.myEntity) return await this.myEntity.update(idInput, this.ctx.request.body);
  }

  async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (this.myEntity) return await this.myEntity.delete(idInput);
  }
}
