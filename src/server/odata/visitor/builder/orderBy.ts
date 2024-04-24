/**
 * OrderBy builder
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _COLUMNSEPARATOR } from "../../../constants";
import { Core } from ".";

export class OrderBy extends Core {
  constructor(input?: string) {
    super(input);
  }
}
