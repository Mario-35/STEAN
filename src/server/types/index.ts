/**
 * Index Types.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
export { IodataContext } from "./odataContext";
export { IcolumnOption } from "./columnOption";
export { IreturnResult } from "./returnResult";
export { IreturnFormat } from "./returnFormat";
export { IcsvFile } from "./csvFile";
export { IcsvColumn } from "./csvColumn";
export { IentityColumn } from "./entityColumn";
export { IconfigFile } from "./configFile";
export { IentityRelation } from "./entityRelation";
export { IdbConnection } from "./dbConnection";
export { Ientity } from "./entity";
export { IpgQuery } from "./pgQuery";
export { IstreamInfos } from "./streamInfos";
export { Iuser } from "./user";
export { Iquery } from "./query";
export { ILoraDecoder } from "./loraDecoder";
export { IuserToken } from "./userToken";
export interface IKeyString { [key: string]: string; }
export interface IKeyBoolean { [key: string]: boolean; }