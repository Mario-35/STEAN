/**
 * message.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import util from "util";
import { _debug } from "../constants";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const message = (
    testDebug: boolean,
    mode: "HEAD" | "DEBUG" | "RESULT" | "INFO" | "ERROR" | "ENV" | "CLASS" | "OVERRIDE",
    cle: string,
    info?: any
): void => {
    if (process.env.NODE_ENV == "test" && mode == "RESULT" && !info) {
        console.log(`\x1b[32m     >>\x1b[31m ${cle} \x1b[39m : \x1b[36m ${info}\x1b[0m`);
        return;
    }

    if (testDebug && !_debug) return;

    if (info && typeof info === "object") info = util.inspect(info, { showHidden: false, depth: null, colors: true });
    switch (mode) {
        case "HEAD": {
            if (info) console.log(`\x1b[32m ==== \x1b[36m ${cle} \x1b[37m ${info} \x1b[32m ====\x1b[0m`);
            else console.log(`\x1b[32m ==== \x1b[33m ${cle} \x1b[32m ====\x1b[0m`);
            break;
        }
        case "DEBUG": {
            console.log(`\x1b[32m ${cle} \x1b[37m : \x1b[36m ${info}\x1b[0m`);
            break;
        }
        case "RESULT": {
            console.log(`\x1b[32m     >>\x1b[30m ${cle} \x1b[39m : \x1b[36m ${info}\x1b[0m`);
            break;
        }
        case "INFO": {
            console.log(`\x1b[36m ${cle} \x1b[34m : \x1b[37m ${info}\x1b[0m`);
            break;
        }
        case "ERROR": {
            console.log(`\x1b[31m ${cle} \x1b[34m : \x1b[33m ${info}\x1b[0m`);
            break;
        }
        case "ENV": {
            console.log(`\x1b[36m ${cle} \x1b[34m : \x1b[33m ${info}\x1b[0m`);
            break;
        }
        case "CLASS": {
            if (info) console.log(`\x1b[31m ==== \x1b[36m ${cle} \x1b[33m ${info} \x1b[31m ====\x1b[0m`);
            else console.log(`\x1b[31m ==== \x1b[36m ${cle} \x1b[31m ====\x1b[0m`);
            break;
        }
        case "OVERRIDE": {
            if (info) console.log(`\x1b[31m ==== \x1b[32m ${cle} [OVERRIDE]\x1b[33m ${info} \x1b[31m ====\x1b[0m`);
            else console.log(`\x1b[31m ==== \x1b[36m ${cle} \x1b[31m ====\x1b[0m`);
            break;
        }
        default: {
            console.log("\x1b[31m" + cle + info);

            break;
        }
    }
};


// Reset : "\x1b[0m",
// Bright : "\x1b[1m",
// Dim : "\x1b[2m",
// Underscore : "\x1b[4m",
// Blink : "\x1b[5m",
// Reverse : "\x1b[7m",
// Hidden : "\x1b[8m",
// FgBlack : "\x1b[30m",
// FgRed : "\x1b[31m",
// FgGreen : "\x1b[32m",
// FgYellow : "\x1b[33m",
// FgBlue : "\x1b[34m",
// FgMagenta : "\x1b[35m",
// FgCyan : "\x1b[36m",
// FgWhite : "\x1b[37m",
// FgGray : "\x1b[90m",
// BgBlack : "\x1b[40m",
// BgRed : "\x1b[41m",
// BgGreen : "\x1b[42m",
// BgYellow : "\x1b[43m",
// BgBlue : "\x1b[44m",
// BgMagenta : "\x1b[45m",
// BgCyan : "\x1b[46m",
// BgWhite : "\x1b[47m",
// BgGray : "\x1b[100m",