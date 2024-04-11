/**
 * GroupBy builder
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _COLUMNSEPARATOR } from "../../../constants";
import { formatLog } from "../../../logger";
import { core } from "./core";

export class GroupBy extends core {
  constructor(input: string) {
    console.log(formatLog.whereIam());
    super(input);
  }
}
