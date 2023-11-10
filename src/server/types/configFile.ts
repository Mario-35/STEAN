/**
 * dbConnection interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import postgres from "postgres";
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
    createUser?: boolean;
    forceHttps: boolean;
    extensions: string[];
    alias: string[];
    highPrecision: boolean;
    logFile: string;
    entities: string[];
    db: postgres.Sql<Record<string, unknown>> | undefined;
}

