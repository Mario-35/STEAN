/**
 * getDBDateNow.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { executeSqlValues } from ".";
import { IconfigFile } from "../../types";

export const getDBDateNow = async ( config: IconfigFile ): Promise<string> => await executeSqlValues(config, "SELECT current_timestamp;").then((res: object) => res[0]);