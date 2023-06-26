/**
 * loginUser.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { createToken } from ".";
import { serverConfig } from "../configuration";
import { ADMIN } from "../constants";
import { _DBADMIN } from "../db/constants";
import { decrypt } from "../helpers";
import { Iuser } from "../types";

export const loginUser = async (ctx: koa.Context): Promise<Iuser | undefined> => {
    if (ctx.request.body["username"] && ctx.request.body["password"]) {
        return await serverConfig.db(ADMIN)
            .table(_DBADMIN.Users.table)
            .where("username", ctx.request.body["username"])
            .first()
            .then((user: Iuser) => {        
                if (user && ctx.request.body && ctx.request.body["password"].match(decrypt(user.password)) !== null) {
                    const token = createToken(user, ctx.request.body["password"]);
                    ctx.cookies.set("jwt-session", token);
                    user.token = token;
                    return Object.freeze(user);
                }
            }).catch((error) => {
                console.error(error);
                return undefined;
            });
    } else {
        console.log("c'est ici que ca se passe");
    }
};
