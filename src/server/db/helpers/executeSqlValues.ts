/**
 * executeSqlValues.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { serverConfig } from "../../configuration";
import { log } from "../../log";
import { isTest } from "../../helpers";
import { IconfigFile } from "../../types";

export const executeSqlValues = async (config: IconfigFile | string, query: string): Promise<object> => {
    log.query(`\n${query}`);
    return new Promise(async function (resolve, reject) {
        await serverConfig.connection(typeof config === "string" ? config : config.name).unsafe(query).values().then((res: object) => { 
            resolve(res[0]);
        }).catch((err: Error) => {
            if (!isTest() && +err["code"] === 23505) log.queryError(query, err);
            reject(err);
        });
    });
};