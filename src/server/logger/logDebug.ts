/**
 * logDebug.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { logAll, _DEBUG,  } from "../constants";

export const logDebug = (input: any, full?: boolean): void => {
    if (_DEBUG) {
        if (full && full == true) logAll(input);
        else console.log(input);
    }
};
