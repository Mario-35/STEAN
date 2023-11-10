/**
 * executeSqlValues.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { serverConfig } from "../../configuration";
import { Logs } from "../../logger";

export const executeSql = async (configName: string, query: string, values: boolean, show?:boolean): Promise<object> => {
    Logs.query(`\n${query}`);
    if(show) {
        console.log("===============================================================");
        console.log(query);
    }
    return values && values == true ? 
    new Promise(async function (resolve, reject) {
        await serverConfig.db(configName).unsafe(query).values().then((res: object) => {            
            resolve(res[0]);
        }).catch((err: Error) => {
            reject(err);
        });
    })
    : new Promise(async function (resolve, reject) {
        await serverConfig.db(configName).unsafe(query).then((res: object) => {       
                resolve(res[0]);
            }).catch((err: Error) => {
                reject(err);
            });
    });
};