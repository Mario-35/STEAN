/**
 * Configs entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- Configs entity. -----------------------------------!");
import { Common } from "./common";
import { formatLog } from "../../logger";
import { IreturnResult, koaContext } from "../../types";
import { serverConfig } from "../../configuration";
import { hideKeysInJson, hidePassword } from "../../helpers";
import { addToService, createService } from "../helpers";
import { _NOTOK, _OK } from "../../constants";
import { userAuthenticated } from "../../authentication";

export class Configs extends Common {
  constructor(ctx: koaContext) {
    console.log(formatLog.whereIam());
    super(ctx);
  }

  async getAll(): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    // Return result If not authorised
    if (!userAuthenticated(this.ctx)) return this.formatReturnResult({
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
    console.log(formatLog.whereIam());
    // Return result If not authorised
    if (!userAuthenticated(this.ctx)) this.ctx.throw(401);
    // Return result
    return this.formatReturnResult({
      body: hideKeysInJson(
        serverConfig.getConfig( typeof idInput === "string" ? idInput : this.ctx.config.name ), ["entities"] ),
    });
  }
  
  async post(dataInput: Record<string, any> | undefined): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
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
    if (dataInput)
      return this.formatReturnResult({
        body: await serverConfig.addConfig(dataInput),
      });
  }

  // Delete an item
  async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam(idInput));
    return;
  }
}
