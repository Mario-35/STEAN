/**
 * IcolumnOptions interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IKeyBoolean } from ".";

export interface IcolumnOption {
    table: boolean;
    numeric: boolean;
    cast: boolean;
    as: boolean;
    test: IKeyBoolean | undefined;
}


