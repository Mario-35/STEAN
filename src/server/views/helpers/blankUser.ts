/**
 * blankUser
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Iuser, koaContext } from "../../types";


export function blankUser(ctx: koaContext):Iuser  {    
    console.log("========== blankUser =======================");
    console.log(ctx.config.users);
    return {
        id: 0,
        username: "query",
        password: "",
        email: "",
        database: "",
        canPost: !ctx.config.users,
        canDelete: !ctx.config.users,
        canCreateUser: !ctx.config.users,
        canCreateDb: !ctx.config.users,
        admin: false,
        superAdmin: false
    }
};
