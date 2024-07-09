/**
 * blankUser
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- blankUser -----------------------------------!");
import { EExtensions } from "../../enums";
import { Iuser, koaContext } from "../../types";


export function blankUser(ctx: koaContext):Iuser  {    
    const tmp = {
        id: 0,
        username: "query",
        password: "",
        email: "",
        database: ctx.config.pg.database,
        canPost: !ctx.config.extensions.includes(EExtensions.users),
        canDelete: !ctx.config.extensions.includes(EExtensions.users),
        canCreateUser: !ctx.config.extensions.includes(EExtensions.users),
        canCreateDb: !ctx.config.extensions.includes(EExtensions.users),
        admin: false,
        superAdmin: false
    }
    console.log(tmp);
    
    return tmp ;
};
