/**
 * executeSql.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { serverConfig } from "../../configuration";
import { _DEBUG } from "../../constants";
import { Elog } from "../../enums";
import { isTest } from "../../helpers";
import { Logs } from "../../logger";

export const executeSql = async (configName: string, query: string, show?:boolean): Promise<object> => {
    Logs.showQuery(`\n${query}`, [Elog.whereIam, (_DEBUG === true || show) ? Elog.Show : Elog.None]);
    return new Promise(async function (resolve, reject) {
        await serverConfig.db(configName).unsafe(query).then((res: object) => {                
            resolve(res);
        }).catch((err: Error) => {
            if (!isTest() && +err["code"] === 23505) Logs.errorQuery(query, err);
            reject(err);
        });
    });
};