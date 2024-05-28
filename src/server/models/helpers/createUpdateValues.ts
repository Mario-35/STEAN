/**
 * createUpdateValues.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- createUpdateValues. -----------------------------------!");
import { ESCAPE_SIMPLE_QUOTE } from "../../constants";
import { addDoubleQuotes, addSimpleQuotes } from "../../helpers";
import { formatLog } from "../../logger";

export function createUpdateValues(input : object ): string  {
    console.log(formatLog.whereIam());
    const result:string[] = [];
    Object.keys(input).forEach((e: string) => {
      // @ts-ignore
          result.push(`${addDoubleQuotes(e)} = ${addSimpleQuotes(ESCAPE_SIMPLE_QUOTE(input[e]))}`);
      });
    return result.join();
  };