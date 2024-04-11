/**
 * Users entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Common } from "./common";
import { formatLog } from "../../logger";
import { IreturnResult } from "../../types";
import { serverConfig } from "../../configuration";
import { hidePassword } from "../../helpers";
import { errors } from "../../messages/";
import { EuserRights } from "../../enums";
import { ADMIN } from "../../constants";
import { executeSqlValues } from "../helpers";
import { models } from "../../models";

export class Users extends Common {
  constructor(ctx: koa.Context) {
    console.log(formatLog.whereIam());
    super(ctx);
  }
  // Override get all to return all users only if rights are good
  async getAll(): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (this.ctx.user?.PDCUAS[EuserRights.SuperAdmin] === true || this.ctx.user?.PDCUAS[EuserRights.Admin] === true ) {
      const temp = await executeSqlValues(serverConfig.getConfig(ADMIN), `SELECT ${models.getSelectColumnList(models.DBAdmin(serverConfig.getConfig(ADMIN)).Users)} FROM "user" ORDER BY "id"`);      
      return this.createReturnResult({
        body: hidePassword(temp),
      });
    } else this.ctx.throw(401, { code: 401, detail: errors[401] });
  }
  // Override to creste a new config and load it 
  async post(dataInput: object | undefined): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (dataInput)
      return this.createReturnResult({
        body: await serverConfig.addConfig(dataInput),
      });
  }
}
