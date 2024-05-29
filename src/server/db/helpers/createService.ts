/**
 * createService
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- createService -----------------------------------!");
import { addToService, createDatabase, executeAdmin, executeSqlValues } from ".";
import { serverConfig } from "../../configuration";
import { _NOTOK, _OK } from "../../constants";
import { addDoubleQuotes, addSimpleQuotes, asyncForEach } from "../../helpers";
import { models } from "../../models";
import { createInsertValues } from "../../models/helpers";
import { sqlStopDbName } from "../../routes/helper";
import { userAccess } from "../dataAccess";
import { keyobj, koaContext } from "../../types";
import { log } from "../../log";

const prepareDatas = (dataInput: Record<string, string>, entity: string): object => {
  if (entity === "Observations") {
    if (!dataInput["resultTime"] && dataInput["phenomenonTime"] ) dataInput["resultTime"]  = dataInput["phenomenonTime"] 
    if (!dataInput["phenomenonTime"] && dataInput["resultTime"] ) dataInput["phenomenonTime"]  = dataInput["resultTime"] 
  }
  return dataInput;
}

const getConvertedData = async (url: string): Promise<object> => {
  return fetch(url, { method: 'GET', headers: {}, }).then((response) => response.json());
}

const addToServiceFromUrl = async (url: string | undefined, ctx: koaContext): Promise<string> => {
  while(url) {
    try {      
      const datas = await getConvertedData(url) as object;
      await addToService(ctx, datas);
      return datas["@iot.nextLink" as keyof object];
    } catch (error) {  
      console.log(error) ;
      return "";
    }
  }
  return "";
}

export const createService = async (dataInput: Record<string, any>, ctx?: koaContext): Promise<Record<string, any>> => {
  const results: Record<string, string>  = {};
  const serviceName = dataInput["create" as keyobj]["name"];
  const config = serverConfig.getConfig(serviceName);
  const mess = `Database [${serviceName}]`; 
  const createDB = async () => {
    try {  
      await createDatabase(serviceName);

      results[`Create ${mess}`  ] = _OK;
      await userAccess.post(serviceName, {
        username: config.pg.user,
        email: "default@email.com",
        password: config.pg.password,
        database: config.pg.database,
        canPost: true,
        canDelete: true,
        canCreateUser: true,
        canCreateDb: true,
        superAdmin: false,
        admin: false
    });
    } catch (error) {
      results[`Create ${mess}`] = _NOTOK;
      console.log(error);        
    }      
  }

  await executeAdmin(sqlStopDbName(addSimpleQuotes(serviceName))).then(async () => {
    await executeAdmin(`DROP DATABASE IF EXISTS ${serviceName}`).then(async () => {
      results[`Drop ${mess}`] = _OK;
      await createDB();
    }).catch((error: any) => {
      results[`Drop ${mess}`] = _NOTOK;
      console.log(error);        
    });
  }).catch(async (err: any) => {
    if (err["code"] === "3D000") {
      await createDB();
    }
  });

  const tmp = models.filteredModelFromConfig(config);
    
  await asyncForEach( Object.keys(tmp) .filter((elem: string) => tmp[elem].createOrder > 0) .sort((a, b) => (tmp[a].createOrder > tmp[b].createOrder ? 1 : -1)), async (entityName: string) => {
    if (dataInput[entityName]) {
      const goodEntity = models.getEntity(config, entityName);
      if (goodEntity) {
        try {
    const sqls: string[] =dataInput[entityName].map((element: any) =>`INSERT INTO ${addDoubleQuotes(goodEntity.table)} ${createInsertValues(config, prepareDatas(element, goodEntity.name), goodEntity.name)}`);
          await executeSqlValues(serverConfig.getConfig(serviceName), sqls.join(";")).then((res: Record<string, any>) =>{
            results[entityName] = _OK;
          }).catch((error: any) => {
            log.errorMsg(error);
            results[entityName] = _NOTOK;
          });
        } catch (error) {
          log.errorMsg(error);           
          results[entityName] = _NOTOK;
        }
      }
    }
  });
    
  if (ctx && dataInput["create"]["imports"]) {
    await asyncForEach(dataInput["create"]["imports"], async (url: string | undefined) => {
      url = `${url}&$top=1000`; 
      while(url !+ "") {
        url = await addToServiceFromUrl(url, ctx);
      }
    });
  }
    
  return results;
}
