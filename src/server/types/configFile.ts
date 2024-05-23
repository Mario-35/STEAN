/**
 * dbConnection interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import postgres from "postgres";
import { EnumVersion } from "../enums";
import { IdbConnection } from "./dbConnection";

export interface IconfigFile {
    name: string; // name of the config file
    key?: string; // key for crypto
    pg: IdbConnection; // postgresSql connection
    port: number; // server port
    apiVersion: EnumVersion; // api version / model
    date_format: string; // formating date
    webSite: string; // website
    nb_page: number; // number of items by page
    forceHttps: boolean; // add s to http
    stripNull: boolean; // remove all null value in json result
    extensions: string[]; // extensions see Enum EnumExtensions
    alias: string[]; // alias name of the service
    highPrecision: boolean; // int8 instead of int4 in postgresSql
    canDrop: boolean; // can drop database (like test db or usefull when build new service)
    users: boolean; // use users rights
    logFile: string; // name of the log fole
    connection: postgres.Sql<Record<string, unknown>> | undefined; // not in file only when running to store connection
}

