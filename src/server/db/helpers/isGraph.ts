/**
 * isGraph.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { returnFormats } from "../../helpers";
import { PgVisitor } from "../../odata";

export const isGraph = (input: PgVisitor) => [returnFormats.graph, returnFormats.graphDatas].includes(input.resultFormat) ? true : undefined;
