/**
 * Index Helpers.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const fileWithOutMin = (input: string): string => input.replace(".min",'');
export { commonHtml } from "./commonHtml";
export { CreateHtmlView } from "./CreateHtmlView";
export { createIqueryFromContext } from "./createIqueryFromContext";
