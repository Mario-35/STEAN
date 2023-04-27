/**
 * returnResult interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export interface IreturnResult {
    id: bigint | undefined;
    nextLink: string | undefined;
    prevLink: string | undefined;
    body: JSON | string | undefined;
    total: bigint | undefined;
}
