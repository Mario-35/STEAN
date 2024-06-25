/**
 * Api dataAccess.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- Api dataAccess. -----------------------------------!");
import * as entities from "../entities/index";
import { Common } from "../entities/common";
import { Icomon, IreturnResult, koaContext } from "../../types";
import { isArray } from "../../helpers";
import { models } from "../../models";
import { log } from "../../log";


// Interface API
export class apiAccess implements Icomon {
  readonly myEntity: Common | undefined;
  readonly ctx: koaContext;

  constructor(ctx: koaContext, entity?: string) {
    console.log(log.whereIam());
    this.ctx = ctx;    
    const entityName = models.getEntityName(this.ctx.config, entity ? entity : this.ctx.odata.entity);
    if (entityName && entityName in entities) {
      // @ts-ignore
      this.myEntity = new entities[(this.ctx, entityName)](ctx);
    } 
  }
  
  formatDataInput(input: object | undefined): object | undefined {
    console.log(log.whereIam());
    return this.myEntity ? this.myEntity.formatDataInput(input) : input;
  }

  async getAll(): Promise<IreturnResult | undefined> {    
    console.log(log.whereIam());
    if (this.myEntity) return await this.myEntity.getAll();
  }

  async getSingle( idInput: bigint | string ): Promise<IreturnResult | undefined> {
    console.log(log.whereIam());
    if (this.myEntity) return await this.myEntity.getSingle(idInput);
  }

  async post(dataInput?: object | undefined): Promise<IreturnResult | undefined | void> {
    console.log(log.whereIam());
    if (this.myEntity) 
      return isArray(this.ctx.body)
        ? await this.myEntity.addWultipleLines(dataInput || this.ctx.body)
        : await this.myEntity.post(dataInput || this.ctx.body);
  }

  async update(idInput: bigint | string): Promise<IreturnResult | undefined | void> {
    console.log(log.whereIam());
    if (this.myEntity) return await this.myEntity.update(idInput, this.ctx.body);
  }

  async delete(idInput: bigint | string): Promise<IreturnResult | undefined | void> {
    console.log(log.whereIam());
    if (this.myEntity) return await this.myEntity.delete(idInput);
  }
}
