/**
 * Log  class.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

// import { isTest } from "../helpers";
import fs from "fs";
import util from "util";
import { EColor } from "../enums";
import { color, showAll, _DEBUG, _ERRORFILE, _OK } from "../constants";
import { isTest } from "../helpers";
import { Lexer } from "../odata/parser";

// class to logCreate configs environements
class Log {
  static logFile: fs.WriteStream;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public errorMsg(...data: any[]) {
    if(isTest()) return;
    Log.logFile = fs.createWriteStream(_ERRORFILE, { flags: "a" });
    Log.logFile.write( util.format.apply(null, data).replace(/\u001b[^m]*?m/g, "") + "\n" );
    process.stdout.write(util.format.apply(null, data) + "\n");
    return data;
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
    if(_DEBUG) process.stdout.write(`${color(EColor.FgYellow)}${"=".repeat(20)}[ Query ]${"=".repeat(20)}\n${color(EColor.FgCyan)} ${showAll(sql)}${color( EColor.Reset )}\n`);
  }

  public queryError<T>(query: unknown, error: T) {  
    process.stdout.write(`${color(EColor.FgGreen)} ${"=".repeat(15)} ${color( EColor.FgCyan )} ERROR ${color(EColor.FgGreen)} ${"=".repeat(15)}${color( EColor.Reset )}
      ${color(EColor.FgRed)} ${error} ${color( EColor.FgBlue )}
      ${color(EColor.FgCyan)} ${showAll(query, false ) }${color(EColor.Reset)}`);
  }

      // Usefull for id not used ;)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  oData(infos: Lexer.Token | undefined) {  
    if(infos && _DEBUG)  {
      const tmp = `${color(EColor.FgFadeWhite)} ${infos} ${color(EColor.Reset)}`;
      process.stdout.write(`${color(EColor.FgRed)} ${"=".repeat(8)} ${color(EColor.FgCyan)} ${ new Error().stack?.split("\n")[2].trim().split("(")[0].split("at ")[1].trim() } ${tmp}${color(EColor.FgRed)} ${"=".repeat(8)}${color(EColor.Reset)}`);
    }
    return infos;
  }

  public init() {
    console.log(this.message("Log", "ready " + _OK));    
  }
}

export const log = new Log();
