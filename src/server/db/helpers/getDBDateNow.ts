/**
 * getDBDateNow.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { executeSqlValues } from ".";

export const getDBDateNow = async ( configName: string ): Promise<string> => await executeSqlValues(configName, "SELECT current_timestamp;").then((res: object) => res[0]);