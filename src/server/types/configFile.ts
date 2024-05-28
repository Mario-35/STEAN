/**
 * dbConnection interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- dbConnection interface. -----------------------------------!");
import postgres from "postgres";
import { typeExtensions, typeOptions } from ".";
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
    options: typeof typeOptions; // Options see Enum EnumOptions
    extensions: typeof typeExtensions; // extensions see Enum EnumExtensions
    alias: string[]; // alias name of the service
    connection: postgres.Sql<Record<string, unknown>> | undefined; // not in file only when running to store connection
}

