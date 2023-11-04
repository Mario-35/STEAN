/**
 * context interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */


export interface Icontext {
    key?: string;
    target?: string | undefined;
    identifier?: string;
    relation?: string;
    table?: string;
    literal?: string;
}
