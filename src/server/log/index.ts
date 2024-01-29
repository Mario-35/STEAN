/**
 * Log  class.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { isTest } from "../helpers";
import fs from "fs";
import util from "util";
import { EColor } from "../enums";
import { color, showAll, _DEBUG, _ERRORFILE, _OK } from "../constants";

// class to logCreate configs environements
class Log {
  static logFile: fs.WriteStream;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public errorMsg(...data: any[]) {
    if(isTest()) return;
    Log.logFile = fs.createWriteStream(_ERRORFILE, { flags: "a" });
    Log.logFile.write( util.format.apply(null, data).replace(/\u001b[^m]*?m/g, "") + "\n" );
    process.stdout.write(util.format.apply(null, data) + "\n");
  }

  public booting<T>(cle: string, value: T) { 
    process.stdout.write(`\x1b[${ EColor.FgCyan }m ${cle} \x1b[${EColor.FgWhite}m ${value}\x1b[${EColor.Reset}m\n`);
  }
  
  public error<T>(cle: unknown, infos?: T) {
    process.stdout.write(`${color(EColor.FgRed)} ${cle} ${color( EColor.FgBlue )} : ${color(EColor.FgYellow)} ${showAll( infos, true )}${color(EColor.Reset)}\n`);
  }

  public create(cle: string, value: string | number) {
    process.stdout.write(`${color(EColor.FgWhite)} -->${color( EColor.FgCyan )} ${cle} ${color(EColor.FgWhite)} ${showAll(value)}${color(EColor.Reset)}\n`);
  }

  public message<T>(cle: string, infos: T) {
    return `${color(EColor.FgYellow)} ${cle} ${color( EColor.FgWhite )}:${color(EColor.FgCyan)} ${showAll( infos)}${color(EColor.Reset)}`;
  }

  public query(sql: unknown) {
    if(_DEBUG) process.stdout.write(`${color(EColor.FgYellow)} [Query] ==> \n${color(EColor.FgCyan)} ${showAll(sql)}${color( EColor.Reset )}\n`);
  }

  public queryError<T>(query: unknown, error: T) {  
    process.stdout.write(`${color(EColor.FgGreen)} ${"=".repeat(15)} ${color( EColor.FgCyan )} ERROR ${color(EColor.FgGreen)} ${"=".repeat(15)}${color( EColor.Reset )}
      ${color(EColor.FgRed)} ${error} ${color( EColor.FgBlue )}
      ${color(EColor.FgCyan)} ${showAll(query, false ) }${color(EColor.Reset)}`);
  }

  public init() {
    console.log(this.message("Log", "ready " + _OK));    
  }
}

export const log = new Log();
