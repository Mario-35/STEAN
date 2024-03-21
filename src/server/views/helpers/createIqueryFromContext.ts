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
import { models } from "../../models";
import { decodeUrl } from "../../routes/helper/decodeUrl";
import { Ientities, IqueryOptions } from "../../types";


export const createIqueryFromContext = async (ctx: koa.Context): Promise<IqueryOptions| undefined> => {
    const model = models.filteredModelFromConfig(ctx.config);
    let user = await getAuthenticatedUser(ctx); 
    user = user
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
            }
    const listEntities = user.superAdmin === true
        ? Object.keys(model)
        : user.admin === true
            ? Object.keys(model).filter((elem: string) => ctx.model[elem].order > 0 || ctx.model[elem].createOrder === 99 || ctx.model[elem].createOrder === -1)
            : user.canPost === true
                ? Object.keys(model).filter((elem: string) => ctx.model[elem].order > 0 || ctx.model[elem].createOrder === 99 || ctx.model[elem].createOrder === -1)
                : Object.keys(model).filter((elem: string) => ctx.model[elem].order > 0 && ctx.model[elem].createOrder !== -1);

    const decodedUrl = decodeUrl(ctx);

    if (decodedUrl) return {
        methods: ["GET"],
        decodedUrl: decodedUrl,
        entity:  "",
        options: ctx.querystring ? ctx.querystring : "",
        user: user,
        graph: ctx.url.includes("$resultFormat=graph"),
        admin: ctx.config.name === 'admin',
        services: serverConfig.getAllInfos(ctx),
        _DATAS:  Object.fromEntries(Object.entries(model).filter( ([k]) => listEntities.includes(k))) as Ientities,

    };
};
