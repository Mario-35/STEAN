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
import { EnumColor } from "../enums";
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
    process.stdout.write(`\x1b[${ EnumColor.FgCyan }m ${cle} \x1b[${EnumColor.FgWhite}m ${value}\x1b[${EnumColor.Reset}m\n`);
  }
  
  public error<T>(cle: unknown, infos?: T) {
    process.stdout.write(`${color(EnumColor.FgRed)} ${cle} ${color( EnumColor.FgBlue )} : ${color(EnumColor.FgYellow)} ${showAll( infos, true )}${color(EnumColor.Reset)}\n`);
  }

  public create(cle: string, value: string | number) {
    process.stdout.write(`${color(EnumColor.FgWhite)} -->${color( EnumColor.FgCyan )} ${cle} ${color(EnumColor.FgWhite)} ${showAll(value)}${color(EnumColor.Reset)}\n`);
  }

  public message<T>(cle: string, infos: T) {
    return `${color(EnumColor.FgYellow)} ${cle} ${color( EnumColor.FgWhite )}:${color(EnumColor.FgCyan)} ${showAll( infos)}${color(EnumColor.Reset)}`;
  }

  public query(sql: unknown) {
    if(_DEBUG) process.stdout.write(`${color(EnumColor.FgYellow)}${"=".repeat(20)}[ Query ]${"=".repeat(20)}\n${color(EnumColor.FgCyan)} ${showAll(sql)}${color( EnumColor.Reset )}\n`);
  }

  public queryError<T>(query: unknown, error: T) {  
    process.stdout.write(`${color(EnumColor.FgGreen)} ${"=".repeat(15)} ${color( EnumColor.FgCyan )} ERROR ${color(EnumColor.FgGreen)} ${"=".repeat(15)}${color( EnumColor.Reset )}
      ${color(EnumColor.FgRed)} ${error} ${color( EnumColor.FgBlue )}
      ${color(EnumColor.FgCyan)} ${showAll(query, false ) }${color(EnumColor.Reset)}`);
  }

      // Usefull for id not used ;)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  oData(infos: Lexer.Token | undefined) {  
    if(infos && _DEBUG)  {
      const tmp = `${color(EnumColor.FgFadeWhite)} ${infos} ${color(EnumColor.Reset)}`;
      process.stdout.write(`${color(EnumColor.FgRed)} ${"=".repeat(8)} ${color(EnumColor.FgCyan)} ${ new Error().stack?.split("\n")[2].trim().split("(")[0].split("at ")[1].trim() } ${tmp}${color(EnumColor.FgRed)} ${"=".repeat(8)}${color(EnumColor.Reset)}`);
    }
    return infos;
  }

  public init() {
    console.log(this.message("Log", "ready " + _OK));    
  }
}

export const log = new Log();
