/**
 * formatedColumn.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import {  _COLUMNSEPARATOR } from "../../../constants";
import { addDoubleQuotes, testStringsIn } from "../../../helpers";
import { formatLog } from "../../../logger";
import { IconfigFile, Ientity, IKeyBoolean } from "../../../types";

/**
 * 
 * @param config config
 * @param entity entity name
 * @param column column name
 * @param options options
 * @returns formated column or 
 */

export function formatedColumn(config: IconfigFile, entity : Ientity, column: string, options?: IKeyBoolean): string | undefined {   
    console.log(formatLog.whereIam(column));
        const tests = ["CONCAT", "CASE", "COALESCE"];
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

