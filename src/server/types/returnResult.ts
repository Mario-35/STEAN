/**
 * ReturnResult interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export interface IReturnResult {
    id: bigint | undefined;
    nextLink: string | undefined;
    prevLink: string | undefined;
    body: Object | string | undefined;
    total: bigint | undefined;
}
