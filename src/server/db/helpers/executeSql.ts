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

const executeSqlOne = async (config: IconfigFile, query: string): Promise<object> => {
    log.query(query);
    return new Promise(async function (resolve, reject) {
        await serverConfig.connection(config.name).unsafe(query).then((res: object) => {                            
            resolve(res);
        }).catch((err: Error) => {
            if (!isTest() && +err["code"] === 23505) log.queryError(query, err);
            reject(err);
        });
    });
};

const executeSqlMulti = async (config: IconfigFile, query: string[]): Promise<object> => {
    log.query(query);
    return new Promise(async function (resolve, reject) {
        await serverConfig.connection(config.name).begin(sql => query.map((e: string) => sql.unsafe(e)))
        .then((res: object) => {                            
            resolve(res);
        }).catch((err: Error) => {
            if (!isTest() && +err["code"] === 23505) log.queryError(query, err);
            reject(err);
        });
    });
};

export const executeSql = async (config: IconfigFile, query: string | string[]): Promise<object> => typeof query === "string" 
    ? executeSqlOne(config, query) 
    : executeSqlMulti(config, query);