/**
 * Index Logs.
 *
 * @copyright 2020-present Inrae
 * @review 29-01-2024
 * @author mario.adam@inrae.fr
 *
 */
import util from "util";
import { TEST, color,  TIMESTAMP, _DEBUG, _ERRORFILE, _WEB } from "../constants";
import fs from "fs";
import Koa from "koa";
import { EColor } from "../enums";
export { writeToLog } from "./writeToLog";


class FormatLog {
  private debugFile = false;
  private line = (nb: number)  => "=".repeat(nb);
  private logAll = (input: any, colors?: boolean) => typeof input === "object" ? util.inspect(input, { showHidden: false, depth: null, colors: colors || false, }) : input;
  private separator = (title: string, nb: number) => `${color(EColor.FgGreen)} ${this.line(nb)} ${color( EColor.FgYellow )} ${title} ${color(EColor.FgGreen)} ${this.line(nb)}${color( EColor.Reset )}`;
  private logCleInfos = (cle: string, infos: object) =>  `${color(EColor.FgGreen)} ${cle} ${color( EColor.FgWhite )} : ${color(EColor.FgCyan)} ${this.logAll( infos, this.debugFile )}${color(EColor.Reset)}`;
  constructor() {
    // override console log important in production build will remove all console.log
    console.log = (data: any) => {  
      if(data && process.env.NODE_ENV?.trim() !== TEST ) this.write(data);
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
        res.push(this.logCleInfos("  " + cle, input[cle]));
      });
      return res.join("\n");
    }
  }

  url(link: string) {
    return `${_WEB} ${color(EColor.FgFadeWhite)} : ${color( EColor.FgCyan )} ${link}${color(EColor.Reset)}`;
  }

  head<T>(cle: string, infos?: T) {
    if (_DEBUG) return infos ? `${color(EColor.FgGreen)} ${this.line(12)} ${color( EColor.FgCyan )} ${cle} ${color(EColor.FgWhite)} ${this.logAll( infos, this.debugFile )} ${color(EColor.FgGreen)} ${this.line(12)}${color( EColor.Reset )}` : this.separator(cle, 12);
  }

  infos(cle: string, input: unknown) {
      if (_DEBUG) return `${this.separator(cle, 30)} ${color(EColor.FgYellow)} ${this.logAll(input, true)}${color( EColor.Reset )}`;
  }

  debug<T>(cle: string, infos: T) {
    if (_DEBUG) return `${color(EColor.FgGreen)} ${cle} ${color( EColor.FgWhite )} : ${color(EColor.FgCyan)} ${this.logAll( infos, this.debugFile )}${color(EColor.Reset)}`;
  }

  result<T>(cle: string, infos?: T) {
    if (_DEBUG) return `${color(EColor.FgGreen)}     >>${color( EColor.FgBlack )} ${cle} ${color(EColor.FgFadeWhite)} : ${color( EColor.FgCyan )} ${this.logAll(infos, this.debugFile)}${color(EColor.Reset)}` ;
  }

  error<T>(cle: unknown, infos?: T) {
    return infos
      ? `${color(EColor.FgRed)} ${cle} ${color( EColor.FgBlue )} : ${color(EColor.FgYellow)} ${this.logAll( infos, this.debugFile )}${color(EColor.Reset)}`
      : `${color(EColor.FgRed)} Error ${color( EColor.FgBlue )} : ${color(EColor.FgYellow)} ${this.logAll(cle)}${color( EColor.Reset )}`;
  }

  // Usefull for id not used ;)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  whereIam(infos?: unknown) {
    const tmp = infos ? `${color(EColor.FgFadeWhite)} ${infos} ${color(EColor.Reset)} ` : '';
    if (_DEBUG) 
      return `${color(EColor.FgRed)} ${this.line(4)} ${color(EColor.FgCyan)} ${ new Error().stack?.split("\n")[2].trim().split(" ")[1] } ${tmp}${color(EColor.FgRed)} ${this.line(4)}${color(EColor.Reset)}`;
  }

  test() {
    return `${color(EColor.FgYellow)} ${this.line(4)} ${color(EColor.FgCyan)} ${ new Error().stack?.split("\n")[2].trim().split(" ")[1] } ${color(EColor.FgYellow)} ${this.line(4)}${color(EColor.Reset)}`;
  }

  writeErrorInFile<T>(ctx: Koa.Context | undefined, ...data: T[]) {
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

