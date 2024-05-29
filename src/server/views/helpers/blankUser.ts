/**
 * blankUser
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- blankUser -----------------------------------!");
import { EnumExtensions } from "../../enums";
import { Iuser, koaContext } from "../../types";


export function blankUser(ctx: koaContext):Iuser  {    
    return {
        id: 0,
        username: "query",
        password: "",
        email: "",
        database: ctx.config.pg.database,
        canPost: !!ctx.config.extensions.includes(EnumExtensions.security),
        canDelete: !!ctx.config.extensions.includes(EnumExtensions.security),
        canCreateUser: !!ctx.config.extensions.includes(EnumExtensions.security),
        canCreateDb: !!ctx.config.extensions.includes(EnumExtensions.security),
        admin: false,
        superAdmin: false
    }
};
