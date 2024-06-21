/**
 * Log class
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- Log class -----------------------------------!");

import fs from "fs";
import util from "util";
import { EColor } from "../enums";
import { color, showAll, _DEBUG, _OK } from "../constants";
import { isTest } from "../helpers";
import { Lexer } from "../odata/parser";

// class to logCreate configs environements
class Log {
  static logFile: fs.WriteStream;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public errorMsg(...data: any[]) {
    if (isTest()) return;
    process.stdout.write(util.format.apply(null, data) + "\n");
    return data;
  }

  public booting<T>(cle: string, value: T) { 
    process.stdout.write(`\x1b[${ EColor.Cyan }m ${cle} \x1b[${EColor.White}m ${value}\x1b[${EColor.Reset}m\n`);
  }
  
  public error<T>(cle: unknown, infos?: T) {
    process.stdout.write(`${color(EColor.Red)} ${cle} ${color( EColor.Blue )} : ${color(EColor.Yellow)} ${showAll( infos, true )}${color(EColor.Reset)}\n`);
  }

  public create(cle: string, value: string | number) {
    process.stdout.write(`${color(EColor.White)} -->${color( EColor.Cyan )} ${cle} ${color(EColor.White)} ${showAll(value)}${color(EColor.Reset)}\n`);
  }

  public message<T>(cle: string, infos: T) {
    return `${color(EColor.Yellow)} ${cle} ${color( EColor.White )}:${color(EColor.Cyan)} ${showAll( infos)}${color(EColor.Reset)}`;
  }

  public query(sql: unknown) {
    if (_DEBUG) process.stdout.write(`${color(EColor.Yellow)}${"=".repeat(20)}[ Query ]${"=".repeat(20)}\n${color(EColor.Cyan)} ${showAll(sql)}${color( EColor.Reset )}\n`);
  }

  public queryError<T>(query: unknown, error: T) {  
    process.stdout.write(`${color(EColor.Green)} ${"=".repeat(15)} ${color( EColor.Cyan )} ERROR ${color(EColor.Green)} ${"=".repeat(15)}${color( EColor.Reset )}
      ${color(EColor.Red)} ${error} ${color( EColor.Blue )}
      ${color(EColor.Cyan)} ${showAll(query, false ) }${color(EColor.Reset)}`);
  }

  // Usefull for id not used ;)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  oData(infos: Lexer.Token | undefined) {  
    if (infos && _DEBUG)  {
      const tmp = `${color(EColor.White)} ${infos} ${color(EColor.Reset)}`;
      process.stdout.write(`${color(EColor.Red)} ${"=".repeat(8)} ${color(EColor.Cyan)} ${ new Error().stack?.split("\n")[2].trim().split("(")[0].split("at ")[1].trim() } ${tmp}${color(EColor.Red)} ${"=".repeat(8)}${color(EColor.Reset)}`);
    }
    return infos;
  }
  
  public init() {
    console.log(this.message("Log", "ready " + _OK));    
  }
}

export const log = new Log();
