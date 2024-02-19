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
import { getMetrics } from "../../db/monitoring";
import { decodeUrl } from "../../routes/helper/decodeUrl";
import { IqueryOptions } from "../../types";


export const createIqueryFromContext = async (ctx: koa.Context): Promise<IqueryOptions| undefined> => {
    const user = await getAuthenticatedUser(ctx); 
    const metrics = await getMetrics("keys"); 
    const decodedUrl = decodeUrl(ctx);    
    if (decodedUrl)
    return {
        methods: ["GET"],
        decodedUrl: decodedUrl,
        entity:  "",
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
        admin: ctx.config.name === 'admin',
        metrics: ["all"].concat(metrics as Array<string>),
        services: serverConfig.getAllInfos(ctx),
        _DATAS: ctx.model
    };
};
