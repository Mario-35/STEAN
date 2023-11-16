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
import { serverConfig } from "../../configuration";
import { _DB, _DBFILTERED } from "../../db/constants";
import { _DBADMIN } from "../../db/constants";
import { getMetrics } from "../../db/monitoring";
import { Iquery } from "../../types";


export const createIqueryFromContext = async (ctx: koa.Context): Promise<Iquery> => {
    const user = await getAuthenticatedUser(ctx); 
    const metrics = await getMetrics("keys"); 
    const temp = ctx._config.name === 'admin' === true 
    ? _DBADMIN 
    : user && (user.admin === true || user.superAdmin === true) 
        ? _DB
        : _DBFILTERED(ctx);

    return {
        id: "",
        methods: ["GET"],
        host: ctx._linkBase,
        entity:  "",
        version: ctx._config.apiVersion,
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
        admin: ctx._config.name === 'admin',
        metrics: ["all"].concat(metrics as Array<string>),
        services: Object.keys(serverConfig.configs).filter(e => e!== "admin"),
        _DATAS: Object.fromEntries( Object.entries(temp).filter(([k, v]) => v.visible === true))
    };
};
