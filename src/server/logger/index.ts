/**
 * Index Logs
 *
 * @copyright 2020-present Inrae
 * @review 29-01-2024
 * @author mario.adam@inrae.fr
 *
 */
import util from "util";
import { TEST, color,  TIMESTAMP, _DEBUG, _ERRORFILE, _WEB } from "../constants";
import fs from "fs";
import { EnumColor } from "../enums";
import { koaContext } from "../types";
export { writeToLog } from "./writeToLog";
// onsole.log("!----------------------------------- Index Logs -----------------------------------!");

class FormatLog {
  private debugFile = false;
  private line = (nb: number)  => "=".repeat(nb);
  private logAll = (input: any, colors?: boolean) => typeof input === "object" ? util.inspect(input, { showHidden: false, depth: null, colors: colors || false, }) : input;
  private separator = (title: string, nb: number) => `${color(EnumColor.FgGreen)} ${this.line(nb)} ${color( EnumColor.FgYellow )} ${title} ${color(EnumColor.FgGreen)} ${this.line(nb)}${color( EnumColor.Reset )}`;
  private logCleInfos = (cle: string, infos: object) =>  `${color(EnumColor.FgGreen)} ${cle} ${color( EnumColor.FgWhite )} : ${color(EnumColor.FgCyan)} ${this.logAll( infos, this.debugFile )}${color(EnumColor.Reset)}`;
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
    return `${_WEB} ${color(EnumColor.FgFadeWhite)} : ${color( EnumColor.FgCyan )} ${link}${color(EnumColor.Reset)}`;
  }

  head<T>(cle: string, infos?: T) {
    if (_DEBUG) return infos ? `${color(EnumColor.FgGreen)} ${this.line(12)} ${color( EnumColor.FgCyan )} ${cle} ${color(EnumColor.FgWhite)} ${this.logAll( infos, this.debugFile )} ${color(EnumColor.FgGreen)} ${this.line(12)}${color( EnumColor.Reset )}` : this.separator(cle, 12);
  }

  infos(cle: string, input: unknown) {
      if (_DEBUG) return `${this.separator(cle, 30)} ${color(EnumColor.FgYellow)} ${this.logAll(input, true)}${color( EnumColor.Reset )}`;
  }

  debug<T>(cle: string, infos: T) {
    if (_DEBUG) return `${color(EnumColor.FgGreen)} ${cle} ${color( EnumColor.FgWhite )} : ${color(EnumColor.FgCyan)} ${this.logAll( infos, this.debugFile )}${color(EnumColor.Reset)}`;
  }

  result<T>(cle: string, infos?: T) {
    if (_DEBUG) return `${color(EnumColor.FgGreen)}     >>${color( EnumColor.FgBlack )} ${cle} ${color(EnumColor.FgFadeWhite)} : ${color( EnumColor.FgCyan )} ${this.logAll(infos, this.debugFile)}${color(EnumColor.Reset)}` ;
  }

  error<T>(cle: unknown, infos?: T) {
    return infos
      ? `${color(EnumColor.FgRed)} ${cle} ${color( EnumColor.FgBlue )} : ${color(EnumColor.FgYellow)} ${this.logAll( infos, this.debugFile )}${color(EnumColor.Reset)}`
      : `${color(EnumColor.FgRed)} Error ${color( EnumColor.FgBlue )} : ${color(EnumColor.FgYellow)} ${this.logAll(cle)}${color( EnumColor.Reset )}`;
  }

  // Usefull for id not used ;)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  whereIam(infos?: unknown) {    
    const tmp = infos ? `${color(EnumColor.FgFadeWhite)} ${infos} ${color(EnumColor.Reset)}` : '';
    if (_DEBUG) 
      return `${color(EnumColor.FgRed)} ${this.line(4)} ${color(EnumColor.FgCyan)} ${ new Error().stack?.split("\n")[2].trim().split("(")[0].split("at ")[1].trim() } ${tmp}${color(EnumColor.FgRed)} ${this.line(4)}${color(EnumColor.Reset)}`;
  }

  test() {
    return `${color(EnumColor.FgYellow)} ${this.line(4)} ${color(EnumColor.FgCyan)} ${ new Error().stack?.split("\n")[2].trim().split(" ")[1] } ${color(EnumColor.FgYellow)} ${this.line(4)}${color(EnumColor.Reset)}`;
  }

  writeErrorInFile<T>(ctx: koaContext | undefined, ...data: T[]) {
    const errFile = fs.createWriteStream(_ERRORFILE, { flags: "a" });
    if (ctx) {
      errFile.write(`# ${TIMESTAMP()} : ${ctx.request.url}\n`);
      errFile.write( util.inspect(ctx.request.body, { showHidden: false, depth: null, colors: false, }) + "\n" );
      errFile.write(`${this.line(30)}\n`);
    } else errFile.write(`# ${this.line(10)} ${TIMESTAMP()} ${this.line(10)}\n`);
    errFile.write(util.format.apply(null, data) + "\n");
  }

}
export const formatLog = new FormatLog();

