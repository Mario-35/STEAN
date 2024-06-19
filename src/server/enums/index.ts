/**
 * Index Enums.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- Index Enums. -----------------------------------!");

import { EnumExtensions } from "./extensions";
import { EnumOptions } from "./options";

export { EnumColor } from "./colors";
export { EnumColumnType } from "./colType";
export { EnumDatesType } from "./datesType";
export { allEntities, allEntitiesType, filterEntities } from "./entities";
export { EnumExtensions } from "./extensions";
export { EnumResultFormats } from "./resultFormats";
export { EnumVersion } from "./version";
export { EnumObservationType } from "./observationType";
export { EnumOperation } from "./operation";
export { EnumRelations } from "./relations";
export { EnumOptions } from "./options";
export { EnumUpdate } from "./update";
export { EnumQuery } from "./query";
export { EnumUserRights } from "./userRights";
export const enumKeys = (input: any) => Object.keys(input).filter(prop => isNaN(parseInt(prop)));
export const typeExtensions = Object.keys(EnumExtensions) as Array<keyof typeof EnumExtensions>;
export const typeOptions = Object.keys(EnumOptions) as Array<keyof typeof EnumOptions>;
