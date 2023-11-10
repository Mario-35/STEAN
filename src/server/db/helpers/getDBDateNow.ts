/**
 * getDBDateNow.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { executeSql } from ".";

export const getDBDateNow = async ( configName: string ): Promise<string> => await executeSql(configName, "SELECT current_timestamp;", true).then((res: object) => res[0]);