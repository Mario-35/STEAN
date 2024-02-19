/**
 * getConfigFromPort for user admin.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { serverConfig } from "../../configuration";
import { TEST } from "../../constants";
import { isTest } from "../../helpers";


/**
 * 
 * @param port of the request
 * @returns name of the configuration
 */
export const getConfigFromPort = (port: number | undefined): string | undefined => {
  if (port) {
    const databaseName = isTest()
      ? [TEST]
      : serverConfig.getConfigs().filter( (word) => (word != TEST && serverConfig.getConfig(word).port) == port );
    if (databaseName && databaseName.length === 1) return databaseName[0];
  }
};