/**
 * verifyId.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { executeSqlValues } from ".";
import { addDoubleQuotes } from "../../helpers";

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
      const temp = await executeSqlValues(configName, `SELECT id FROM ${addDoubleQuotes(tableSearch)} WHERE "id" = ${idInput} LIMIT 1`);
      return temp["rowCount"] <= 0 ? false : true;
    } else {
      const temp = await executeSqlValues(configName, `SELECT count(id) FROM ${addDoubleQuotes(tableSearch)}  WHERE "id" IN (${idInput.map(String)})`);
      return Object.values(idInput).length == temp[0].count;
    }
  } catch (error) {
    return false;
  }
};
