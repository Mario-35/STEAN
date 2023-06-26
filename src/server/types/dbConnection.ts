/**
 * dbConnection interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */


export interface IdbConnection {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
    retry: number;
}
