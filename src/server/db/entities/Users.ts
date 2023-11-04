/**
 * Users entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Common } from "./common";
import { Logs } from "../../logger";
import { IreturnResult } from "../../types";
import { serverConfig } from "../../configuration";
import { hidePasswordIn } from "../../helpers";
import { errors } from "../../messages/";
import { EuserRights } from "../../enums";
import { _DBADMIN } from "../constants";
import { ADMIN } from "../../constants";
import { executeSql } from "../helpers";

export class Users extends Common {
  constructor(ctx: koa.Context) {
    super(ctx);
  }

  async getAll(): Promise<IreturnResult | undefined> {
    Logs.whereIam();
    if (
      this.ctx._user?.PDCUAS[EuserRights.SuperAdmin] === true ||
      this.ctx._user?.PDCUAS[EuserRights.Admin] === true
    ) {
      const temp = await executeSql(ADMIN, `SELECT ${Object.keys(_DBADMIN.Users.columns)} FROM "user" ORDERBY "id"`);
      hidePasswordIn(temp);
      return this.createReturnResult({
        body: temp,
      });
    } else this.ctx.throw(401, { code: 401, detail: errors[401] });
  }

  async add(dataInput: object | undefined): Promise<IreturnResult | undefined> {
    Logs.whereIam();
    if (dataInput)
      return this.createReturnResult({
        body: await serverConfig.addConfig(dataInput),
      });
  }
}
