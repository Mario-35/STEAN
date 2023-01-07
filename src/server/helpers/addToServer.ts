/**
 * changeInJson.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _CONFIGFILE } from "../configuration";
import { isDbExist } from "../db/helpers";
import { message } from "../logger";
import Koa from "koa";
import { _PORTS } from "../constants";


/**
 * id : name of the key
 * value : replace value
 * obj: object source
 */

export const addToServer = async (app: Koa<Koa.DefaultState, Koa.DefaultContext>, key: string): Promise<boolean> => {   
              await isDbExist(key, true)
                  .then(async (res: boolean) => {                   
                        const port = _CONFIGFILE[key].port;
                        if (port  > 0) {
                            if (_PORTS.includes(port)) message(false, "RESULT", `\x1b[35m[${key}]\x1b[32m add on port`, port);
                            else app.listen(port, () => {
                                _PORTS.push(port);
                                    message(false, "RESULT", `\x1b[33m[${key}]\x1b[32m listening on port`, port);
                                });
                        }
                        return res;
                        
                    })
                    .catch((e) => {
                        message(false, "ERROR", "Unable to find or create", _CONFIGFILE[key].pg_database);
                        console.log(e);
                        process.exit(111);
                    });
                    return false;
          };