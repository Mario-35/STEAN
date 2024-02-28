/**
 * addToService.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { _NOTOK, _OK } from "../../constants";
import { addDoubleQuotes, asyncForEach } from "../../helpers";
import { models } from "../../models";
import { createInsertValues } from "../../models/helpers";
import { pgVisitorBlankOdata } from "../../odata/visitor/helper";
import { Ilog } from "../../types";
import { apiAccess } from "../dataAccess";
import { executeSqlValues } from "./executeSqlValues";


export const prepareDatas = (dataInput: object, entity: string): object => {
  if (entity === "Observations") {
    if (!dataInput["resultTime"] && dataInput["phenomenonTime"] ) dataInput["resultTime"]  = dataInput["phenomenonTime"] 
    if (!dataInput["phenomenonTime"] && dataInput["resultTime"] ) dataInput["phenomenonTime"]  = dataInput["resultTime"] 
  }
  return dataInput;
}

export const addToService = async (ctx: koa.Context, dataInput: object): Promise<object> => {
  const results = {};    
  const temp = pgVisitorBlankOdata(ctx, ctx.model.Loras);
  if (temp) {
    ctx.odata = temp;
    const objectAccess = new apiAccess(ctx);
    await asyncForEach(dataInput["value"],  async (line: object) => {      
      if (line.hasOwnProperty("payload"))
      try {
        const datas = {
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
          database: ctx.config.pg.base,
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