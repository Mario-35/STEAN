/**
 * Index Logs
 *
 * @copyright 2020-present Inrae
 * @review 29-01-2024
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- Index Logs -----------------------------------!");

import util from "util";
import { TEST, color,  _DEBUG, _WEB } from "../constants";
import { EColor } from "../enums";
export { writeToLog } from "./writeToLog";

class FormatLog {
  private debugFile = false;
  private line = (nb: number)  => "=".repeat(nb);
  private logAll = (input: any, colors?: boolean) => typeof input === "object" ? util.inspect(input, { showHidden: false, depth: null, colors: colors || false, }) : input;
  private separator = (title: string, nb: number) => `${color(EColor.Green)} ${this.line(nb)} ${color( EColor.Yellow )} ${title} ${color(EColor.Green)} ${this.line(nb)}${color( EColor.Reset )}`;
  private logCleInfos = (cle: string, infos: object) =>  `${color(EColor.Green)} ${cle} ${color( EColor.White )} : ${color(EColor.Cyan)} ${this.logAll( infos, this.debugFile )}${color(EColor.Reset)}`;
  constructor() {
    // override console log important in production build will remove all console.log
    console.log = (data: any) => {
      if (data && process.env.NODE_ENV?.trim() !== TEST ) this.write(data);
    };
  }

  write(data: any) {
    process.stdout.write(util.format.apply(null, [data]) + "\n");
  }

  // log an object or json
  object(title: string, input: object) {
    if (_DEBUG) {
      const res = [this.head(title)];
      Object.keys(input).forEach((cle: string) => {
        res.push(this.logCleInfos("  " + cle, input[cle as keyof object]));
      });
      return res.join("\n");
    }
  }

  url(link: string) {
    return `${_WEB} ${color(EColor.Default)} : ${color( EColor.Cyan )} ${link}${color(EColor.Reset)}`;
  }

  head<T>(cle: string, infos?: T) {
    if (_DEBUG) return infos ? `${color(EColor.Green)} ${this.line(12)} ${color( EColor.Cyan )} ${cle} ${color(EColor.White)} ${this.logAll( infos, this.debugFile )} ${color(EColor.Green)} ${this.line(12)}${color( EColor.Reset )}` : this.separator(cle, 12);
  }

  infos(cle: string, input: unknown) {
      if (_DEBUG) return `${this.separator(cle, 30)} ${color(EColor.Yellow)} ${this.logAll(input, true)}${color( EColor.Reset )}`;
  }

  debug<T>(cle: string, infos: T) {
    if (_DEBUG) return `${color(EColor.Green)} ${cle} ${color( EColor.White )} : ${color(EColor.Cyan)} ${this.logAll( infos, this.debugFile )}${color(EColor.Reset)}`;
  }

  result<T>(cle: string, infos?: T) {
    if (_DEBUG) return `${color(EColor.Green)}     >>${color( EColor.Black )} ${cle} ${color(EColor.Default)} : ${color( EColor.Cyan )} ${this.logAll(infos, this.debugFile)}${color(EColor.Reset)}` ;
  }

  error<T>(cle: unknown, infos?: T) {
    return infos
      ? `${color(EColor.Red)} ${cle} ${color( EColor.Blue )} : ${color(EColor.Yellow)} ${this.logAll( infos, this.debugFile )}${color(EColor.Reset)}`
      : `${color(EColor.Red)} Error ${color( EColor.Blue )} : ${color(EColor.Yellow)} ${this.logAll(cle)}${color( EColor.Reset )}`;
  }
  
  whereIam(infos?: unknown) {    
    const tmp = infos ? `${color(EColor.Default)} ${infos} ${color(EColor.Reset)}` : '';
    if (_DEBUG) 
      return `${color(EColor.Red)} ${this.line(4)} ${color(EColor.Cyan)} ${ new Error().stack?.split("\n")[2].trim().split("(")[0].split("at ")[1].trim() } ${tmp}${color(EColor.Red)} ${this.line(4)}${color(EColor.Reset)}`;
  }

  test() {
    return `${color(EColor.Yellow)} ${this.line(4)} ${color(EColor.Cyan)} ${ new Error().stack?.split("\n")[2].trim().split(" ")[1] } ${color(EColor.Yellow)} ${this.line(4)}${color(EColor.Reset)}`;
  }

}
export const formatLog = new FormatLog();

