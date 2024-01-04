/**
 * executeSql.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { serverConfig } from "../../configuration";
import { log } from "../../log";
import { isTest } from "../../helpers";
import { IconfigFile } from "../../types";

export const executeSql = async (config: IconfigFile, query: string): Promise<object> => {
    log.query(`\n${query}`);
    return new Promise(async function (resolve, reject) {
        await serverConfig.getConnection(config.name).unsafe(query).then((res: object) => {                            
            resolve(res);
        }).catch((err: Error) => {
            if (!isTest() && +err["code"] === 23505) log.queryError(query, err);
            reject(err);
        });
    });
};