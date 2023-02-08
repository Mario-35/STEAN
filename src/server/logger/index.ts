/**
 * Index Logs.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

 import util from "util";

export { logDebug } from "./logDebug";
export { message } from "./message";
export { writeToLog } from "./writeToLog";
export const logAll = (input: any, colors?: boolean) => { console.log(util.inspect(input, { showHidden: false, depth: null, colors: colors || false })); }

