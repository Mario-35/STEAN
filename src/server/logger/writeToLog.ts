/**
 * writeToLog.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Logs } from ".";
import { _DB } from "../db/constants";
import util from "util";
import { serverConfig } from "../configuration";
import { hidePasswordInJSON } from "../helpers";

export const writeToLog = async (
  ctx: koa.Context,
  ...error: any[]
): Promise<void> => {
  Logs.whereIam();
  if (error.length > 0) Logs.writeError(ctx, error);
  if (ctx._log && ctx._log.method != "GET") {
    (ctx._log.code =
      error && error["code"] ? +error["code"] : +ctx.response.status),
      (ctx._log.error = util.format.apply(null, error));
    ctx._log.datas = hidePasswordInJSON(ctx._log.datas);
    if (ctx.body && ctx.body && typeof ctx.body === "string")
      ctx._log.returnid = JSON.parse(ctx.body)["@iot.id"];
    const code = Math.floor(ctx._log.code / 100);
    if (
      ctx._odata &&
      ctx._odata.idLog &&
      BigInt(ctx._odata.idLog) > 0 &&
      code !== 2
    )
      return;
    Logs.debug("Write To logs", ctx._log);
    await serverConfig
      .db(ctx._config.name)
      .table(_DB.Logs.table)
      .insert(ctx._log)
      .returning("id")
      .catch((error) => {
        console.log(error);
      });
  }
};
