/**
 * isCsvOrArray.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { returnFormats } from "../../helpers";
import { PgVisitor } from "../../odata";

export const isCsvOrArray = (input: PgVisitor) => [returnFormats.dataArray, returnFormats.csv].includes(input.resultFormat) ? true : undefined;
