/**
 * Configs entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Common } from "./common";
import { formatLog } from "../../logger";
import { IconfigFile, IreturnResult } from "../../types";
import { serverConfig } from "../../configuration";
import { hideKeysInJson, hidePasswordIn } from "../../helpers";
import { ensureAuthenticated } from "../../authentication";

export class Configs extends Common {
  constructor(ctx: koa.Context) {
    super(ctx);
  }

  async getAll(): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (!ensureAuthenticated(this.ctx)) return this.createReturnResult({
      body: hidePasswordIn(serverConfig.getConfig(this.ctx._config.name))
    });
    const result: { [key: string]: IconfigFile } = {};
    serverConfig.getConfigs().forEach((elem: string) => { 
      result[elem] = { ...serverConfig.getConfig(elem) }; 
    });
    return this.createReturnResult({
      body: hidePasswordIn(result)
    });
  }

  async getSingle( idInput: bigint | string ): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (!ensureAuthenticated(this.ctx)) this.ctx.throw(401);
    return this.createReturnResult({
      body: hideKeysInJson(
        serverConfig.getConfig( typeof idInput === "string" ? idInput : this.ctx._config.name ), ["entities"] ),
    });
  }

  async post(dataInput: object | undefined): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (!ensureAuthenticated(this.ctx)) this.ctx.throw(401);
    if (dataInput)
      return this.createReturnResult({
        body: await serverConfig.addConfig(dataInput),
      });
  }

  // Delete an item
  async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
   console.log(formatLog.whereIam(idInput));
    return;
  }
}
