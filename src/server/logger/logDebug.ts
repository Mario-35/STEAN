/**
 * logDebug.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { logAll } from ".";
import { _debug } from "../constants";

export const logDebug = (input: any, full?: boolean): void => {
    if (_debug === true) {
        if (full && full == true) logAll(input);
        else console.log(input);
    }
};
