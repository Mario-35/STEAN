/**
 * executeSql.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { serverConfig } from "../../configuration";
import { Logs } from "../../logger";

 
export const executeSql = async (configName: string, sql: string): Promise<object> => {
    Logs.query(`\n${sql}`);
    return new Promise(async function (resolve, reject) {
        try {
            const query = await serverConfig.db(configName).raw(sql);    
            if (query) 
                resolve(query);
            else 
                reject(Error("It broke"));
        } catch (error) {
            reject(error);
        }
      });
};
