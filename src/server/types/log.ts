/**
 * log interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export interface Ilog{
    method: string;
    returnid?: string;
    code: number;
    url: string;
    database: string;
    datas: object;
    user_id: string;
    error?: object;
  }