/**
 * addToService.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { _NOTOK, _OK } from "../../constants";
import { Eentities } from "../../enums";
import { addDoubleQuotes, asyncForEach } from "../../helpers";
import { formatLog } from "../../logger";
import { models } from "../../models";
import { createInsertValues } from "../../models/helpers";
import { blankPgVisitor } from "../../odata/visitor/helper";
import { Ilog } from "../../types";
import { apiAccess } from "../dataAccess";
import { executeSqlValues } from "./executeSqlValues";


export const prepareDatas = (dataInput: object, entity: string): object => {
  if (entity === Eentities.Observations) {
    if (!dataInput["resultTime"] && dataInput["phenomenonTime"] ) dataInput["resultTime"]  = dataInput["phenomenonTime"] 
    if (!dataInput["phenomenonTime"] && dataInput["resultTime"] ) dataInput["phenomenonTime"]  = dataInput["resultTime"] 
  }
  return dataInput;
}

export const addToService = async (ctx: koa.Context, dataInput: object): Promise<object> => {
  console.log(formatLog.whereIam());
  // setDebug(true);
  const results = {};    
  const temp = blankPgVisitor(ctx, ctx.model.Loras);
  if (temp) {
    ctx.odata = temp;
    const objectAccess = new apiAccess(ctx);
    await asyncForEach(dataInput["value"],  async (line: object) => {    
      // console.log(line);
      if(line["payload"] != "000000000000000000")  
      try {


        const datas = line["value"] 
        ? {
          "timestamp": line["phenomenonTime"], 
          "value": line["value"], 
          "deveui": line["deveui"].toUpperCase()
        } : {
          "timestamp": line["phenomenonTime"], 
          "frame": line["payload"].toUpperCase(), 
          "deveui": line["deveui"].toUpperCase()
        };
        await objectAccess.post(datas);  
      } catch (error: any) {
        const datas: Ilog = {
          method: "PAYLOADS",
          code: error["code"] ? +error["code"] : +ctx.response.status,
          url: "/Loras",
          database: ctx.config.pg.database,
          datas: line,
          user_id: String(ctx.user.id),
          error: error
        } ;
        await executeSqlValues(ctx.config, `INSERT INTO ${addDoubleQuotes(models.DBFull(ctx.config).Logs.table)} ${createInsertValues(ctx.config, datas, models.DBFull(ctx.config).Logs.name)} returning id`);

      }
    });
  }
    return results;
}