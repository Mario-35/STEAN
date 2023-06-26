/**
 * Logs entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
import koa from "koa";
import { Common } from "./common";
import { serverConfig } from "../../configuration";
import { ADMIN } from "../../constants";
 
export class Logs extends Common {
    constructor(ctx: koa.Context) {         
         super(ctx);
        Common.dbContext = serverConfig.db(ADMIN);    
    }
}
 