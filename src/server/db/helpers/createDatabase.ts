/**
 * createDatabase.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

 import koa from "koa";
import { createAdminDataBase } from "./createAdminDataBase";
import { createSTDatabase } from "./createSTDatabase";
  
  export const createDatabase = async(configName: string, ctx?: koa.Context): Promise<{ [key: string]: string }> => {
    return configName.toUpperCase() === "ADMIN" ? createAdminDataBase(configName, ctx) : createSTDatabase(configName, ctx); 
 }