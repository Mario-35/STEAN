/**
 * ReturnResult interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IKeyValues } from ".";

export interface IReturnResult {
    id: bigint | undefined;
    nextLink: string | undefined;
    prevLink: string | undefined;
    body: IKeyValues[] | IKeyValues | string | undefined;
    total: bigint | undefined;
}
