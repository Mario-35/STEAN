/**
 * executeAdmin.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { serverConfig } from "../../configuration";
import { ADMIN, _DEBUG } from "../../constants";
import { Elog } from "../../enums";
import { Logs } from "../../logger";

export const executeAdmin = async (query: string, show?:boolean): Promise<object> => {
    Logs.showQuery(`\n${query}`, [Elog.whereIam, (_DEBUG === true || show) ? Elog.Show : Elog.None]);
    return new Promise(async function (resolve, reject) {
        await serverConfig.db(ADMIN).unsafe(query).then((res: object) => {                            
            resolve(res);
        }).catch((err: Error) => {
            reject(err);
        });
    });
};