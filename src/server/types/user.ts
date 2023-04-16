/**
 * user interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export interface Iuser {
    id?: number; // integer
    username: string; // character varying
    password: string; // character varying
    email: string; // character varying
    database: string; // character varying
    canPost: boolean; // boolean
    canDelete: boolean; // boolean
    canCreateUser: boolean; // boolean
    canCreateDb: boolean; // boolean
    admin: boolean; // boolean
    superAdmin: boolean; // boolean
    token?: string; // integer
}