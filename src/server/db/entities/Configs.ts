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
import { IreturnResult } from "../../types";
import { serverConfig } from "../../configuration";
import { hideKeysInJson, hidePassword } from "../../helpers";
import { ensureAuthenticated } from "../../authentication";
import { addToService, createService } from "../helpers";
import { _NOTOK, _OK } from "../../constants";
import { createPayloads } from "../helpers/createService";


export class Configs extends Common {
  constructor(ctx: koa.Context) {
    super(ctx);
  }

  async getAll(): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    // Return result If not authorised
    if (!ensureAuthenticated(this.ctx)) return this.createReturnResult({
      body: hidePassword(serverConfig.getConfig(this.ctx.config.name))
    });    
    // Return result
    return this.createReturnResult({
      body: hidePassword(serverConfig.getConfigs().map((elem: string) => ({ 
        [elem] : { ...serverConfig.getConfig(elem) }
      })))
    });
  }

  async getSingle( idInput: bigint | string ): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    // Return result If not authorised
    if (!ensureAuthenticated(this.ctx)) this.ctx.throw(401);
    // Return result
    return this.createReturnResult({
      body: hideKeysInJson(
        serverConfig.getConfig( typeof idInput === "string" ? idInput : this.ctx.config.name ), ["entities"] ),
    });
  }
  
  async post(dataInput: object | undefined): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if(dataInput && dataInput["create"] && dataInput["create"]["name"]) {
      return this.createReturnResult({
        body: await createService(dataInput, this.ctx),
      });
    } else if(dataInput && dataInput["add"] && dataInput["add"]["name"]) {
      return this.createReturnResult({
        body: await addToService(this.ctx, dataInput),
      });
    }  else if(dataInput && dataInput["pays"] && dataInput["pays"]["name"]) {
      return this.createReturnResult({
        body: await createPayloads(dataInput, this.ctx),
      });
    }
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
