/**
 * redoLog.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { db } from "..";
import { message } from "../../logger";
import { _DBDATAS } from "../constants";

export const redoLog = async (ctx: koa.Context, id: string | bigint): Promise<boolean> => {
    message(true, "INFO", "redoLog", id);
    const logLine =  await db["admin"]
    .table(_DBDATAS.Logs.table)
    .whereRaw(`id = ${id}`);
    console.log(logLine);


  
    return true
};
