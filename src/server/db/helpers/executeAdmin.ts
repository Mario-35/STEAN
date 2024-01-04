/**
 * executeAdmin.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { serverConfig } from "../../configuration";
import { ADMIN } from "../../constants";
import { log } from "../../log";

export const executeAdmin = async (query: string): Promise<object> => {
    log.query(`\n${query}`);
    return new Promise(async function (resolve, reject) {
        await serverConfig.getConnection(ADMIN).unsafe(query).then((res: object) => {                            
            resolve(res);
        }).catch((err: Error) => {
            reject(err);
        });
    });
};