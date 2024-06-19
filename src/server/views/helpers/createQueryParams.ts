/**
 * createQueryParams
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- createQueryParams -----------------------------------!");

import { getAuthenticatedUser } from "../../authentication";
import { serverConfig } from "../../configuration";
import { formatLog } from "../../logger";
import { models } from "../../models";
import { decodeUrl } from "../../routes/helper/decodeUrl";
import { Ientities, IqueryOptions, koaContext } from "../../types";
import { blankUser } from "./blankUser";

export async function createQueryParams(ctx: koaContext): Promise<IqueryOptions| undefined> {
    console.log(formatLog.whereIam());
    const model = models.filteredModelFromConfig(ctx.config);
    let user = await getAuthenticatedUser(ctx);
    user = user ? user : blankUser(ctx);
    const listEntities = user.superAdmin === true
        ? Object.keys(model)
        : user.admin === true
            ? Object.keys(model).filter((elem: string) => ctx.model[elem].order > 0 || ctx.model[elem].createOrder === 99 || ctx.model[elem].createOrder === -1)
            : user.canPost === true
                ? Object.keys(model).filter((elem: string) => ctx.model[elem].order > 0 || ctx.model[elem].createOrder === 99 || ctx.model[elem].createOrder === -1)
                : Object.keys(model).filter((elem: string) => ctx.model[elem].order > 0 );

    listEntities.push("Configs");   

    const decodedUrl = decodeUrl(ctx);
    if (decodedUrl) return {
        methods: ["GET"],
        decodedUrl: decodedUrl,
        entity:  "",
        options: ctx.querystring ? ctx.querystring : "",
        user: user,
        graph: ctx.url.includes("$resultFormat=graph"),
        admin: ctx.config.name === 'admin',
        services: serverConfig.getInfosForAll(ctx),
        _DATAS:  Object.fromEntries(Object.entries(model).filter( ([k, v]) => listEntities.includes(k) && v.order > 0)) as Ientities,
    };
};
