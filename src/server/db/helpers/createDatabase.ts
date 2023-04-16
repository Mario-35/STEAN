/**
 * createDatabase.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createAdminDataBase } from "./createAdminDataBase";
import { createSTDatabase } from "./createSTDatabase";
  
  export const createDatabase = async(configName: string): Promise<{ [key: string]: string }> => {
    return configName.toUpperCase() === "ADMIN" ? createAdminDataBase(configName) : createSTDatabase(configName); 
 };