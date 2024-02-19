/**
 * createService.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { executeAdmin, executeSqlValues } from ".";
import { serverConfig } from "../../configuration";
import { _NOTOK, _OK } from "../../constants";
import { addDoubleQuotes, addSimpleQuotes, asyncForEach } from "../../helpers";
import { models } from "../../models";
import { createInsertValues } from "../../models/helpers";
import { sqlStopDbName } from "../../routes/helper";
import { createSTDB } from "../createDb/createStDb";

export const prepareDatas = (dataInput: object, entity: string): object => {
  if (entity === "Observations") {
    if (!dataInput["resultTime"] && dataInput["phenomenonTime"] ) dataInput["resultTime"]  = dataInput["phenomenonTime"] 
    if (!dataInput["phenomenonTime"] && dataInput["resultTime"] ) dataInput["phenomenonTime"]  = dataInput["resultTime"] 
  }
  return dataInput;
}

export const createService = async (dataInput: object): Promise<object> => {
    const results = {};
    const serviceName = dataInput["create"]["name"];
    const config = serverConfig.getConfig(serviceName);
    const mess = `Database [${serviceName}]`; 
    await executeAdmin(sqlStopDbName(addSimpleQuotes(serviceName))).then(async () => {
      await executeAdmin(`DROP DATABASE IF EXISTS ${serviceName}`).then(async () => {
        results[`Drop ${mess}`] = _OK;
        try {  
          await createSTDB(serviceName);
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
    // await executeAdmin(`commit;`);

    const tmp = models.filteredModelFromConfig(config);
    
    await asyncForEach( Object.keys(tmp)
                          .filter((elem: string) => tmp[elem].createOrder > 0)
                          .sort((a, b) => (tmp[a].createOrder > tmp[b].createOrder ? 1 : -1)), 
      async (entityName: string) => {
      if (dataInput[entityName]) {
        
        const goodEntity = models.getEntity(config, entityName);
        if (goodEntity) {
          try {
            const sqls: string[] =dataInput[entityName].map((element: any) =>`INSERT INTO ${addDoubleQuotes(goodEntity.table)} ${createInsertValues(config, prepareDatas(element, goodEntity.name), goodEntity.name)}`);
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