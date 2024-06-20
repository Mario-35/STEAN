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
    return {
        id: 0,
        username: "query",
        password: "",
        email: "",
        database: ctx.config.pg.database,
        canPost: !!ctx.config.extensions.includes(EExtensions.security),
        canDelete: !!ctx.config.extensions.includes(EExtensions.security),
        canCreateUser: !!ctx.config.extensions.includes(EExtensions.security),
        canCreateDb: !!ctx.config.extensions.includes(EExtensions.security),
        admin: false,
        superAdmin: false
    }
};
