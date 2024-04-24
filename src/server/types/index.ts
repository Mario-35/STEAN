/**
 * Index Types.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

// import { allEntitiesType } from "../enums";
import { Ientity } from "./entity";
export { Icomon } from "./comon";
export { IconfigFile } from "./configFile";
export { IcsvColumn } from "./csvColumn";
export { IcsvFile } from "./csvFile";
export { IcsvImport } from "./csvImport";
export { IdbConnection } from "./dbConnection";
export { Ientity } from "./entity";
export { IentityColumn } from "./entityColumn";
export { IentityRelation } from "./entityRelation";
export { Ilog } from "./log";
export { ILoraDecoder } from "./loraDecoder";
export { IodataContext } from "./odataContext";
export { IpgQuery } from "./pgQuery";
export { IqueryOptions } from "./queryOptions";
export { IreturnFormat } from "./returnFormat";
export { IreturnResult } from "./returnResult";
export { IserviceLink } from "./serviceLink";
export { IstreamInfos } from "./streamInfos";
export { Iuser } from "./user";
export { IuserToken } from "./userToken";
export { IdecodedUrl } from "./decodedUrl";
export interface IKeyBoolean { [key: string]: boolean; }
export interface IKeyString { [key: string]: string; }
export type Ientities = { [key: string]: Ientity }