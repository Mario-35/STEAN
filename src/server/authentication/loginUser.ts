/**
 * loginUser.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createToken } from ".";
import { serverConfig } from "../configuration";
import { decrypt } from "../helpers";
import { formatLog } from "../logger";
import { Iuser, koaContext } from "../types";

export const loginUser = async ( ctx: koaContext ): Promise<Iuser | undefined> => {  
  console.log(formatLog.whereIam());

  const mario = await serverConfig.connection(ctx.config.name).unsafe(`SELECT * FROM pg_user;`)

  console.log(mario);
  




  if (ctx.body["username"] && ctx.body["password"]) {
    const query = await serverConfig.connection(ctx.config.name)<Iuser[]>`SELECT * FROM "user" WHERE username = ${ctx.body["username"]} LIMIT 1`;
    
    

    if (query.length === 1) {           
      const user:Iuser = { ... query[0] }            
      if ( user && ctx.body && ctx.body["password"].match(decrypt(user.password)) !== null ) {
        const token = createToken(user, ctx.body["password"]);
        ctx.cookies.set("jwt-session", token);
        user.token = token;
        return Object.freeze(user);
      }
    } else ctx.throw(404);
  } else ctx.throw(401);
};
