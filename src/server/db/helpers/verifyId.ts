/**
 * verifyId.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { executeSql } from ".";

/**
 *
 * @param configName name of actual service config name
 * @param idInput bigint or bigint[]
 * @param tableSearch name of the table to search ID(s)
 * @returns boolean
 */

export const verifyId = async ( configName: string, idInput: bigint | bigint[], tableSearch: string ): Promise<boolean> => {
  try {
    if (typeof idInput == "bigint") {
      const temp = await executeSql(configName, `SELECT id FROM "${tableSearch}" WHERE "id" = ${idInput} LIMIT 1`, true);
      return temp["rowCount"] <= 0 ? false : true;
    } else {
      const temp = await executeSql(configName, `SELECT count(id) FROM "${tableSearch}" WHERE "id" IN (${idInput.map(String)})`, true);
      return Object.values(idInput).length == temp[0].count;
    }
  } catch (error) {
    return false;
  }
};
