/**
 * createIqueryFromContext Index HTML / JS maker.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

/* eslint-disable quotes */

import koa from "koa";
import { getAuthenticatedUser } from "../../authentication";
import { CONFIGURATION } from "../../configuration";
import { DBDATAS } from "../../db/constants";
import { _DBADMIN } from "../../db/constants";
import { createDbList } from "../../db/helpers";
import { Iquery } from "../../types";

export const createIqueryFromContext = async (ctx: koa.Context): Promise<Iquery> => {
    const user = await getAuthenticatedUser(ctx);    
    return {
        id: "",
        methods: ["GET"],
        host: ctx._linkBase,
        entity:  "",
        version: ctx._version,
        options: ctx.querystring ? ctx.querystring : "",
        user: user
            ? user
            : {
                  id: 0,
                  username: "query",
                  password: "",
                  email: "",
                  database: "",
                  canPost: false,
                  canDelete: false,
                  canCreateUser: false,
                  canCreateDb: false,
                  admin: false,
                  superAdmin: false
              },
              // TODO universal return
        graph: ctx.url.includes("$resultFormat=graph"),
        admin: ctx._configName === 'admin',
        _DATAS: ctx._configName === 'admin' === true 
            ? _DBADMIN 
            : user && (user.admin === true || user.superAdmin === true) 
                ? DBDATAS 
                : createDbList(CONFIGURATION.list[ctx._configName].dbEntities)

    };
};
