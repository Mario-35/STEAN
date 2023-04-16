/**
 * pgQuery interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export interface IpgQuery {
    from: string;
    select: string;
    where?: string;
    orderby?: string;
    groupBy?: string;
    skip?: number;
    limit?: number;
}
