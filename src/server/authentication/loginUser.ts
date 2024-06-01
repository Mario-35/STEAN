/**
 * loginUser
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- loginUser -----------------------------------!");

import { createToken } from ".";
import { serverConfig } from "../configuration";
import { decrypt } from "../helpers";
import { Iuser, koaContext } from "../types";

export const loginUser = async ( ctx: koaContext ): Promise<Iuser | undefined> => {
  const body: Record<string, any> = ctx.request.body as Record<string, any>;
  if (body["username"] && body["password"]) {    
    const query = await serverConfig.connection(ctx.config.name)<Iuser[]>`SELECT * FROM "user" WHERE username = ${body["username"]} LIMIT 1`;
    if (query.length === 1) {  
      const user:Iuser = { ... query[0] } 
      if ( user && body && body["password"].match(decrypt(user.password)) !== null ) {
        const token = createToken(user, body["password"]);
        ctx.cookies.set("jwt-session", token);
        user.token = token;
        return Object.freeze(user);
      }
    } else ctx.throw(404);
  } else ctx.throw(401);
};
