import util from "util";
import { TIMESTAMP, _DEBUG } from "../constants";
import fs from "fs";
import Koa from "koa";
import { EColor } from "../enums";
import { IKeyString } from "../types";
import { isProduction, isTest } from "../helpers";

export class Logger {
  private debugFile = false;
  col(col: number) {
    return `\x1b[${col}m`;
  }

  line(nb: number) {
    return "=".repeat(nb);
  }

  separator(title: string, nb: number) {
    return `${this.col(EColor.FgGreen)} ${this.line(nb)} ${this.col(
      EColor.FgYellow
    )} ${title} ${this.col(EColor.FgGreen)} ${this.line(nb)}${this.col(
      EColor.Reset
    )}`;
  }

  private log<T>(input: T) {
    console.log(input);
  }

  logAll<T>(input: T, colors?: boolean) {
    return typeof input === "object"
      ? util.inspect(input, {
          showHidden: false,
          depth: null,
          colors: colors || false,
        })
      : input;
  }

  booting(cle: string, value: string | number) {
    if (!isTest())
      this.log(
        `${this.col(EColor.FgYellow)} -->${this.col(
          EColor.FgCyan
        )} ${cle} ${this.col(EColor.FgWhite)} ${this.logAll(
          value,
          this.debugFile
        )} ${this.col(EColor.FgYellow)} …${this.col(EColor.Reset)}`
      );
  }

  bootingResult<T>(cle: string, infos?: T) {
    if (!isTest())
      this.log(
        `${this.col(EColor.FgGreen)}     <--${this.col(
          EColor.FgBlack
        )} ${cle} ${this.col(EColor.FgMario)} : ${this.col(
          EColor.FgCyan
        )} ${this.logAll(infos, this.debugFile)}${this.col(EColor.Reset)}`
      );
  }

  head<T>(cle: string, infos?: T) {
    if (_DEBUG)
      this.log(
        infos
          ? `${this.col(EColor.FgGreen)} ${this.line(4)} ${this.col(
              EColor.FgCyan
            )} ${cle} ${this.col(EColor.FgWhite)} ${this.logAll(
              infos,
              this.debugFile
            )} ${this.col(EColor.FgGreen)} ${this.line(4)}${this.col(
              EColor.Reset
            )}`
          : this.separator(cle, 4)
      );
  }

  keys(title: string, input: IKeyString) {
    this.head(title);
    Object.keys(input).forEach((cle: string) => {
      this.debug(`  ${cle}`, input[cle]);
    });
  }

  query(sql: unknown) {
    if (_DEBUG) this.log(this.separator("Query", 30));
    if (_DEBUG)
      this.log(
        `${this.col(EColor.FgCyan)} ${this.logAll(sql)}${this.col(
          EColor.Reset
        )}`
      );
  }

  infos(cle: string, input: unknown) {
    if (_DEBUG) this.log(this.separator(cle, 30));
    if (_DEBUG)
      this.log(
        `${this.col(EColor.FgYellow)} ${this.logAll(input, true)}${this.col(
          EColor.Reset
        )}`
      );
  }

  debug<T>(cle: string, infos: T) {
    if (_DEBUG)
      this.log(
        `${this.col(EColor.FgGreen)} ${cle} ${this.col(
          EColor.FgWhite
        )} : ${this.col(EColor.FgCyan)} ${this.logAll(
          infos,
          this.debugFile
        )}${this.col(EColor.Reset)}`
      );
  }

  result<T>(cle: string, infos?: T) {
    if (_DEBUG)
      this.log(
        `${this.col(EColor.FgGreen)}     >>${this.col(
          EColor.FgBlack
        )} ${cle} ${this.col(EColor.FgMario)} : ${this.col(
          EColor.FgCyan
        )} ${this.logAll(infos, this.debugFile)}${this.col(EColor.Reset)}`
      );
  }

  infoSystem<T>(cle: string, infos?: T) {
    if (_DEBUG)
      this.log(
        `${this.col(EColor.FgCyan)} ${cle} ${this.col(
          EColor.FgBlue
        )} : ${this.col(EColor.FgWhite)} ${this.logAll(
          infos,
          this.debugFile
        )}${this.col(EColor.Reset)}`
      );
  }

  error<T>(cle: unknown, infos?: T) {
    if(!isProduction()) console.log(cle);    
    if (_DEBUG)
      this.log(
        infos
          ? `${this.col(EColor.FgRed)} ${cle} ${this.col(
              EColor.FgBlue
            )} : ${this.col(EColor.FgYellow)} ${this.logAll(
              infos,
              this.debugFile
            )}${this.col(EColor.Reset)}`
          : `${this.col(EColor.FgRed)} Error ${this.col(
              EColor.FgBlue
            )} : ${this.col(EColor.FgYellow)} ${this.logAll(cle)}${this.col(
              EColor.Reset
            )}`
      );
  }

  env<T>(testDebug: boolean, cle: string, infos?: T) {
    if (_DEBUG)
      this.log(
        `${this.col(EColor.FgCyan)} ${cle} ${this.col(
          EColor.FgBlue
        )} : ${this.col(EColor.FgYellow)} ${this.logAll(
          infos,
          this.debugFile
        )}${this.col(EColor.Reset)}`
      );
  }
  whereIam() {
    if (_DEBUG)
      this.log(
        `${this.col(EColor.FgRed)} ${this.line(4)} ${this.col(EColor.FgCyan)} ${
          new Error().stack?.split("\n")[2].trim().split(" ")[1]
        } ${this.col(EColor.FgRed)} ${this.line(4)}${this.col(EColor.Reset)}`
      );
  }

  logQuery<T>(input: T, full?: boolean) {
    if (_DEBUG) this.log(full && full == true ? this.logAll(input) : input);
  }

  writeError<T>(ctx: Koa.Context | undefined, ...data: T[]) {
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

  start(cle: string) {
    if (_DEBUG)
      this.log(
        `${this.col(EColor.FgRed)} ${this.line(24)} ${this.col(
          EColor.FgCyan
        )} ${cle} ${this.col(
          EColor.FgWhite
        )} ${new Date().toLocaleDateString()} : ${new Date().toLocaleTimeString()} ${this.col(
          EColor.FgRed
        )} ${this.line(24)}${this.col(EColor.Reset)}`
      );
  }
  end(cle: string) {
    if (_DEBUG)
      this.log(
        `${this.col(EColor.FgGreen)} ${this.line(24)} ${this.col(
          EColor.FgCyan
        )} ${cle} ${this.col(
          EColor.FgWhite
        )} ${new Date().toLocaleDateString()} : ${new Date().toLocaleTimeString()} ${this.col(
          EColor.FgGreen
        )} ${this.line(24)}${this.col(EColor.Reset)}`
      );
  }

  getFuncName() {
    return new Error().stack?.split("\n")[2].trim().split(" ")[1];
  }
}
