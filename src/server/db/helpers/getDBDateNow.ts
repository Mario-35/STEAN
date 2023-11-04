/**
 * getDBDateNow.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { executeSql } from ".";

export const getDBDateNow = async (
  configName: string
): Promise<string> => {
  const tempQuery = await executeSql(configName, "SELECT current_timestamp;");
  return tempQuery["rows"][0]["current_timestamp"];
};
