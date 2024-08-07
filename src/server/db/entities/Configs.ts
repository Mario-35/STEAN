/**
 * Configs entity
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- Configs entity -----------------------------------!");

import { Common } from "./common";
import { IreturnResult, koaContext } from "../../types";
import { serverConfig } from "../../configuration";
import { hideKeysInJson, hidePassword } from "../../helpers";
import { addToService, createService } from "../helpers";
import { setDebug } from "../../constants";
import { userAuthenticated } from "../../authentication";
import { log } from "../../log";
import { EExtensions } from "../../enums";

export class Configs extends Common {
  constructor(ctx: koaContext) {
    console.log(log.whereIam());
    super(ctx);
  }

  async getAll(): Promise<IreturnResult | undefined> {
    console.log(log.whereIam());
    let can = userAuthenticated(this.ctx);
    if (can) {
      can = (this.ctx.user.PDCUAS[4] === true);
      if (this.ctx.user.PDCUAS[5] === true) can = true;
    }
    // Return result If not authorised    
    if (!can) 
        return this.formatReturnResult({
          body: hidePassword(serverConfig.getConfig(this.ctx.config.name))
        });    
    // Return result
    return this.formatReturnResult({
      body: hidePassword(serverConfig.getConfigs().map((elem: string) => ({ 
        [elem] : { ...serverConfig.getConfig(elem) }
      })))
    });
  }

  async getSingle( idInput: bigint | string ): Promise<IreturnResult | undefined> {
    console.log(log.whereIam());
    // Return result If not authorised
    if (!userAuthenticated(this.ctx)) this.ctx.throw(401);
    // Return result
    return this.formatReturnResult({
      body: hideKeysInJson(
        serverConfig.getConfig( typeof idInput === "string" ? idInput : this.ctx.config.name ), ["entities"] ),
    });
  }
  
  async post(dataInput: Record<string, any> | undefined): Promise<IreturnResult | undefined> {
    console.log(log.whereIam());
    if (!this.ctx.config.extensions.includes(EExtensions.users)) this.ctx.throw(401);
    if (dataInput && dataInput["create"] && dataInput["create"]["name"]) {
      return this.formatReturnResult({
        body: await createService(dataInput, this.ctx),
      });
    } else if (dataInput && dataInput["add"] && dataInput["add"]["name"]) {
      return this.formatReturnResult({
        body: await addToService(this.ctx, dataInput),
      });
    }
    if (!userAuthenticated(this.ctx)) this.ctx.throw(401);    
    if (dataInput) {
      const added = await serverConfig.addConfig(dataInput);
      if (added)
        return this.formatReturnResult({
          body: hidePassword(added),
        });
    }
  }

    // Update an item
    async update( idInput: bigint | string, dataInput: Record<string, any>  | undefined ): Promise<IreturnResult | undefined | void> {
      setDebug(true);
      console.log(log.whereIam());      
    }
  // Delete an item
  async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
    console.log(log.whereIam(idInput));
    // This function not exists
    return;
  }
}
