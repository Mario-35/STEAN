/**
 * addToService.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _NOTOK, _OK } from "../../constants";
import { addDoubleQuotes, asyncForEach } from "../../helpers";
import { formatLog } from "../../logger";
import { models } from "../../models";
import { createInsertValues } from "../../models/helpers";
import { blankRootPgVisitor } from "../../odata/visitor/helper";
import { Ilog, koaContext } from "../../types";
import { apiAccess } from "../dataAccess";
import { executeSqlValues } from "./executeSqlValues";

export const addToService = async (ctx: koaContext, dataInput: object): Promise<object> => {
  console.log(formatLog.whereIam());
  // setDebug(true);
  const results = {};    
  const temp = blankRootPgVisitor(ctx, ctx.model.Loras);
  if (temp) {
    ctx.odata = temp;
    const objectAccess = new apiAccess(ctx);
    // @ts-ignore
    await asyncForEach(dataInput["value"],  async (line: object) => {
      // @ts-ignore
      if (line["payload"] != "000000000000000000")  
      try {
        // @ts-ignore
        const datas = line["value"] 
        // @ts-ignore
        ? { "timestamp": line["phenomenonTime"], "value": line["value"], "deveui": line["deveui"].toUpperCase() }
        // @ts-ignore
        : { "timestamp": line["phenomenonTime"], "frame": line["payload"].toUpperCase(), "deveui": line["deveui"].toUpperCase() };
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