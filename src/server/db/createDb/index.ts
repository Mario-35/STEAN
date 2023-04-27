/**
 * createDatabase.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createAdminDB } from "./createAdminDB";
import { createSTDB } from "./createStDb";
  
export const createDatabase = async(configName: string): Promise<{ [key: string]: string }> => {
  return configName.toUpperCase() === "ADMIN" ? await createAdminDB(configName) : await createSTDB(configName); 
};