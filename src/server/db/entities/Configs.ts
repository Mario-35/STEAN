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
import { addDoubleQuotes, addSimpleQuotes, asyncForEach, hideKeysInJson, hidePassword } from "../../helpers";
import { ensureAuthenticated } from "../../authentication";
import { createDatabase, executeAdmin, executeSqlValues } from "../helpers";
import { sqlStopDbName } from "../../routes/helpers";
import { models } from "../../models";
import { _NOTOK, _OK } from "../../constants";


export class Configs extends Common {
  constructor(ctx: koa.Context) {
    super(ctx);
  }

  async getAll(): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (!ensureAuthenticated(this.ctx)) return this.createReturnResult({
      body: hidePassword(serverConfig.getConfig(this.ctx._config.name))
    });
    const result: { [key: string]: IconfigFile } = {};
    serverConfig.getConfigs().forEach((elem: string) => { 
      result[elem] = { ...serverConfig.getConfig(elem) }; 
    });
    return this.createReturnResult({
      body: hidePassword(result)
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

  async createService(dataInput: object): Promise<object> {
    const results = {};
    const serviceName = dataInput["create"]["name"];
    const mess = `Database [${serviceName}]`; 
    await executeAdmin(sqlStopDbName(addSimpleQuotes(serviceName))).then(async () => {
      await executeAdmin(`DROP DATABASE IF EXISTS ${serviceName}`).then(async () => {
        results[`Drop ${mess}`] = _OK;
        try {
          await createDatabase(serviceName);   
          results[`Create ${mess}`  ] = _OK;
        } catch (error) {
          results[`Create ${mess}`] = _NOTOK;
          console.log(error);        
        }
      }).catch((error: any) => {
        results[`Drop ${mess}`] = _NOTOK;
        console.log(error);        
      });
    });
    
    await asyncForEach( ["Things", "Locations", "FeaturesOfInterest", "ObservedProperties","Sensors","Datastreams","MultiDatastreams","Decoders","Loras"], async (entityName: string) => {
      if (dataInput[entityName]) {
        const goodEntity = models.getEntity(this.ctx._config, entityName);
        if (goodEntity) {
          try {
            const sqls: string[] = [];
            dataInput[entityName].forEach((element: any) => {
              const sql = `INSERT INTO ${addDoubleQuotes(goodEntity.table)} ${models.createInsertValues(this.ctx._config, element, goodEntity.name)}`;
              sqls.push(sql);
            });
            await executeSqlValues(serverConfig.getConfig(serviceName), sqls.join(";")).then((res: object) =>{
              results[entityName] = _OK;
            }).catch((error: any) => {
              console.log(error);
              results[entityName] = _NOTOK;
            });
          } catch (error) {
            console.log(error);            
            results[entityName] = _NOTOK;
          }
        }
      }
    });
    return results;
}

  async post(dataInput: object | undefined): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if(dataInput && dataInput["create"] && dataInput["create"]["name"]) {
      return this.createReturnResult({
        body: await this.createService(dataInput),
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
