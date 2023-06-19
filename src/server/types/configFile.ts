/**
 * dbConnection interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export interface IconfigFile {
    name: string; // item of the config file
    key?: string; // key for crypto
    pg_host: string;
    pg_port: number;
    port: number;
    pg_user: string;
    pg_database: string;
    pg_password: string;
    apiVersion: string;
    date_format: string;
    webSite: string;
    nb_page: number;
    retry: number;
    createUser?: boolean;
    forceHttps: boolean;
    alias: string[];
    lora: boolean;
    multiDatastream: boolean;
    highPrecision: boolean;
    logFile: string;
    entities: string[];
}

