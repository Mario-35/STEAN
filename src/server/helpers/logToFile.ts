/**
 * logToFile.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
import fs from "fs";
import util from "util";
import { setDebugFile } from "../constants";
import { _LOGS } from "../logger";

export const logToFile = (active: boolean) => {
  const file = "steam.log";
  if (active) _LOGS.head("active Logs to file", file);

  if (active === false) return;
  setDebugFile(active);
  // Or 'w' to truncate the file every time the process starts.
  const logFile = fs.createWriteStream(file, { flags: 'a' });

  console.log = function (...data: any[]) {
    logFile.write(util.format.apply(null, data).replace(/\u001b[^m]*?m/g,"") + '\n');
    process.stdout.write(util.format.apply(null, data) + '\n');
  };
  console.error = console.log;
};