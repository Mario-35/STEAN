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
import { decrypt } from "../helpers";
import { Iuser } from "../types";

export const loginUser = async ( ctx: koa.Context ): Promise<Iuser | undefined> => {  
  if (ctx.request.body["username"] && ctx.request.body["password"]) {
    const query = await serverConfig.connection(ctx.config.name)<Iuser[]>`SELECT * FROM "user" WHERE username = ${ctx.request.body["username"]} LIMIT 1`;
    if (query.length === 1) {           
      const user:Iuser = { ... query[0] }            
      if ( user && ctx.request.body && ctx.request.body["password"].match(decrypt(user.password)) !== null ) {
        const token = createToken(user, ctx.request.body["password"]);
        ctx.cookies.set("jwt-session", token);
        user.token = token;
        return Object.freeze(user);
      }
    } else ctx.throw(404);
  } else ctx.throw(401);
};
