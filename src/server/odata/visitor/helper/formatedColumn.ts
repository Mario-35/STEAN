/**
 * formatedColumn.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { addDoubleQuotes,  testStringsIn } from "../../../helpers";
import { IconfigFile, Ientity, IKeyBoolean } from "../../../types";

const tests = ["CONCAT", "CASE", "COALESCE"];
// export function formatedColumn(config: IconfigFile, entity : Ientity, column: string, options?: object): string {
//     const temp = entity.columns[column] && entity.columns[column].columnAlias(config, { ...options, as: true});
//     return temp ? temp :  testStringsIn(["CONCAT", "CASE"], column) ? column : `${addDoubleQuotes(entity.table)}.${addDoubleQuotes(column)}`;
// };

export function formatedColumn(config: IconfigFile, entity : Ientity, column: string, options?: IKeyBoolean): string | undefined {   
    // console.log(`column ============================> ${column}`);
    if (entity.columns[column]) {
        const alias =  entity.columns[column].columnAlias(config, options ? options : undefined);
        if (testStringsIn(tests, alias || column) === true) return alias || column;
        if (options) {
            if (alias && options["alias"] === true) return alias;
            let result: string = "";
            if (options["table"] === true && (testStringsIn(tests, alias || column) === false)) result += `${addDoubleQuotes(entity.table)}.`;
            result += alias || options["quoted"] === true ? addDoubleQuotes(column) : column;
            if (options["as"] === true || (alias && alias.includes("->")) ) result += ` AS ${addDoubleQuotes(column)}`;
            return result;
        } else return column;
    } else if (testStringsIn(tests, column) === true) return column;
};
