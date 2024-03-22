/**
 * pgQuery interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export interface IpgQuery {
    select: string;
    from: string;
    count?: string;
    where?: string;
    orderby?: string;
    groupBy?: string;
    skip?: number;
    limit?: number;
}
