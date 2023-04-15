/**
 * Index entities.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export { IUser, userToken } from "./user";
export { IReturnResult } from "./returnResult";
export { IreturnFormat } from "./returnFormats";
export { ICsvFile, ICsvColumns } from "./csvFile";
export { IEntity } from "./entity";
export { PgQuery } from "./pgQuery";
export { ENTITIES, RELATIONS, USERRIGHTS, FORMATS, OPERATIONTYPE } from "./enum";

export enum StreamType {
    Datastreams = "Datastreams",
    MultiDatastreams = "MultiDatastreams",
    None = "None"
 }