/**
 * dbConnection interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";
import { IdbConnection } from "./dbConnection";


export interface IconfigFile {
    name: string; // item of the config file
    key?: string; // key for crypto
    pg: IdbConnection;
    port: number;
    apiVersion: string;
    date_format: string;
    webSite: string;
    nb_page: number;
    nb_logs: number;
    createUser?: boolean;
    forceHttps: boolean;
    alias: string[];
    lora: boolean;
    multiDatastream: boolean;
    highPrecision: boolean;
    logFile: string;
    entities: string[];
    db: Knex<any, unknown[]> | undefined;
}

