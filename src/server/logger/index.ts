/**
 * Index Logs.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
import util from "util";
import { APP_NAME, APP_VERSION, NODE_ENV, TIMESTAMP, _DEBUG, _WEB } from "../constants";
import fs from "fs";
import Koa from "koa";
import { EColor, Elog } from "../enums";
import { IKeyString } from "../types";
import { isProduction, isTest } from "../helpers";
export { writeToLog } from "./writeToLog";


class Logger {
    private debugFile = false;
    constructor() {
      this.log( `${this.col(EColor.FgRed)} ${this.line(24)} ${this.col( EColor.FgCyan )} ${`START ${APP_NAME} version : ${APP_VERSION} [${NODE_ENV}]`} ${this.col( EColor.FgWhite )} ${new Date().toLocaleDateString()} : ${new Date().toLocaleTimeString()} ${this.col( EColor.FgRed )} ${this.line(24)}${this.col(EColor.Reset)}` );
    }

    private col(col: number) { 
        return `\x1b[${col}m`; 
    }
    
    private line(nb: number) { 
        return "=".repeat(nb); 
    }
    
    private separator(title: string, nb: number) { 
        return `${this.col(EColor.FgGreen)} ${this.line(nb)} ${this.col( EColor.FgYellow )} ${title} ${this.col(EColor.FgGreen)} ${this.line(nb)}${this.col( EColor.Reset )}`;
    }
    
    private log<T>(input: T) {
      console.log(input);
    }
    
    logAll<T>(input: T, colors?: boolean) {
        return typeof input === "object" ? util.inspect(input, { showHidden: false, depth: null, colors: colors || false, }) : input;
    }

    private logCleInfos<T>(cle: string, infos: T) {
      this.log( `${this.col(EColor.FgGreen)} ${cle} ${this.col( EColor.FgWhite )} : ${this.col(EColor.FgCyan)} ${this.logAll( infos, this.debugFile )}${this.col(EColor.Reset)}` );
    }

    private headRed(message: string | undefined) {
      this.log( `${this.col(EColor.FgRed)} ${this.line(4)} ${this.col(EColor.FgCyan)} ${ message } ${this.col(EColor.FgRed)} ${this.line(4)}${this.col(EColor.Reset)}` );
    }

    create(cle: string, value: string | number) {
        if (!isProduction()) 
            this.log(`${this.col(EColor.FgWhite)} -->${this.col( EColor.FgCyan )} ${cle} ${this.col(EColor.FgWhite)} ${this.logAll( value, this.debugFile )}${this.col(EColor.Reset)}`);
    }

    url(link: string) {
      if (isProduction()) 
        this.log(`${_WEB} ${this.col(EColor.FgFadeWhite)} : ${this.col( EColor.FgCyan )} ${link}${this.col(EColor.Reset)}`);
    }

    booting<T>(result: boolean, cle: string, value: T) {
      if (!isTest()) 
        if (result === true)
        this.log( `${this.col(EColor.FgGreen)}     <--${this.col( EColor.FgBlack )} ${cle} ${this.col(EColor.FgFadeWhite)} : ${this.col( EColor.FgCyan )} ${this.logAll(value, this.debugFile)}${this.col(EColor.Reset)}` );
        else this.log(`${this.col(EColor.FgYellow)} 💡${this.col( EColor.FgCyan )} ${cle} ${this.col(EColor.FgWhite)} ${this.logAll( value, this.debugFile )}${this.col(EColor.Reset)}`);
    }

    head<T>(cle: string, infos?: T) {
        if (_DEBUG)
            this.log( infos ? `${this.col(EColor.FgGreen)} ${this.line(12)} ${this.col( EColor.FgCyan )} ${cle} ${this.col(EColor.FgWhite)} ${this.logAll( infos, this.debugFile )} ${this.col(EColor.FgGreen)} ${this.line(12)}${this.col( EColor.Reset )}` : this.separator(cle, 12) );
    }

    object(title: string, input: IKeyString) {
        this.head(title);
        Object.keys(input).forEach((cle: string) => { this.logCleInfos("  " + cle, input[cle]); });
    }

    showQuery(sql: unknown, options: Elog[]) {
      if (options.includes(Elog.Show)) {
        if (options.includes(Elog.whereIam))
          this.headRed(new Error().stack?.split("\n")[2].trim().split(" ")[1]);
        this.log( `${this.col(EColor.FgCyan)} ${this.logAll(sql)}${this.col( EColor.Reset )}` );
      }
    }

    infos(cle: string, input: unknown) {
        if (_DEBUG) {
            this.log(this.separator(cle, 30));
            this.log( `${this.col(EColor.FgYellow)} ${this.logAll(input, true)}${this.col( EColor.Reset )}` );
        }
    }

    debug<T>(cle: string, infos: T ,force?: boolean) {
    if (_DEBUG || (force && force === true))
        this.log( `${this.col(EColor.FgGreen)} ${cle} ${this.col( EColor.FgWhite )} : ${this.col(EColor.FgCyan)} ${this.logAll( infos, this.debugFile )}${this.col(EColor.Reset)}` );
    }

    result<T>(cle: string, infos?: T ,force?: boolean) {
      if (_DEBUG || (force && force === true))
        this.log( `${this.col(EColor.FgGreen)}     >>${this.col( EColor.FgBlack )} ${cle} ${this.col(EColor.FgFadeWhite)} : ${this.col( EColor.FgCyan )} ${this.logAll(infos, this.debugFile)}${this.col(EColor.Reset)}` );
    }

  errorQuery<T>(query: unknown, error: T) {  
    this.log(`${this.col(EColor.FgGreen)} ${this.line(15)} ${this.col( EColor.FgCyan )} ERROR ${this.col(EColor.FgGreen)} ${this.line(15)}${this.col( EColor.Reset )}`);
      this.log(`${this.col(EColor.FgRed)} ${error} ${this.col( EColor.FgBlue )}`);
      this.log(`${this.col(EColor.FgCyan)} ${this.logAll(query, false ) }${this.col(EColor.Reset)}`);
  }

  error<T>(cle: unknown, infos?: T) {
    if(!isProduction()) console.log(cle);    
    if (_DEBUG)
      this.log(
        infos
          ? `${this.col(EColor.FgRed)} ${cle} ${this.col( EColor.FgBlue )} : ${this.col(EColor.FgYellow)} ${this.logAll( infos, this.debugFile )}${this.col(EColor.Reset)}`
          : `${this.col(EColor.FgRed)} Error ${this.col( EColor.FgBlue )} : ${this.col(EColor.FgYellow)} ${this.logAll(cle)}${this.col( EColor.Reset )}`
      );
      return false;
  }

  // Usefull for id not used ;)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  whereIam(nop?: unknown) {
    if (_DEBUG)
      this.headRed(new Error().stack?.split("\n")[2].trim().split(" ")[1]);
  }


  writeErrorInFile<T>(ctx: Koa.Context | undefined, ...data: T[]) {
    const errFile = fs.createWriteStream("errorFile.md", { flags: "a" });
    if (ctx) {
      errFile.write(`# ${TIMESTAMP()} : ${ctx.request.url}\n`);
      errFile.write(
        util.inspect(ctx.request.body, {
          showHidden: false,
          depth: null,
          colors: false,
        }) + "\n"
      );
      errFile.write(`${this.line(30)}\n`);
    } else
      errFile.write(`# ${this.line(10)} ${TIMESTAMP()} ${this.line(10)}\n`);
    errFile.write(util.format.apply(null, data) + "\n");
  }

}
export const Logs = new Logger();

