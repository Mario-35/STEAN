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
import { getEntityName } from "../helpers";

// Interface API
export class apiAccess {
  readonly myEntity: Common | undefined;
  readonly ctx: koa.Context;

  constructor(ctx: koa.Context) {
    this.ctx = ctx;
    const entityName = getEntityName(this.ctx._odata.entity);
    if (entityName && entityName in entities) {
      this.myEntity = new entities[(this.ctx, entityName)](ctx);
    } 
  }

  formatDataInput(input: object | undefined): object | undefined {
    Logs.whereIam();
    return this.myEntity ? this.myEntity.formatDataInput(input) : input;
  }

  async getAll(): Promise<IreturnResult | undefined> {
    Logs.whereIam();
    if (this.myEntity) return await this.myEntity.getAll();
  }

  async getSingle( idInput: bigint | string ): Promise<IreturnResult | undefined> {
    Logs.whereIam();
    if (this.myEntity) return await this.myEntity.getSingle(idInput);
  }

  async add(): Promise<IreturnResult | undefined> {
    Logs.whereIam();
    if (this.myEntity) return await this.myEntity.add(this.ctx.request.body);
  }

  async update(idInput: bigint | string): Promise<IreturnResult | undefined> {
    Logs.whereIam();
    if (this.myEntity) return await this.myEntity.update(idInput, this.ctx.request.body);
  }

  async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
    Logs.whereIam();
    if (this.myEntity) return await this.myEntity.delete(idInput);
  }
}
