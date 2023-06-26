/* eslint-disable @typescript-eslint/no-explicit-any */
import util from "util";
import { TIMESTAMP, _debug } from "../constants";
import fs from "fs";
import Koa from "koa";
import { EColor } from "../enums";


export class Logger {
    private debugFile = false;
    col(col: number) {
        return `\x1b[${col}m`;
    }

    line(nb: number) {
        return '='.repeat(nb);
    }

    separator(title: string, nb: number) {
        return `${this.col(EColor.FgGreen)} ${this.line(nb)} ${this.col(EColor.FgYellow)} ${title} ${this.col(EColor.FgGreen)} ${this.line(nb)}${this.col(EColor.Reset)}`;
    }

     show(input: string) {
         if (!_debug) return;
        console.log(input);
     }

     logAll(input: any, colors?: boolean) { 
        return typeof input === "object" ? util.inspect(input, { showHidden: false, depth: null, colors: colors || false }) : input; 
    }

     booting(cle: string, value: string | number) {
         this.show(`${this.col(EColor.FgYellow)} ${this.line(12)} ${this.col(EColor.FgCyan)} ${cle} ${this.col(EColor.FgWhite)} ${this.logAll(value, this.debugFile)} ${this.col(EColor.FgYellow)} ${this.line(12)}${this.col(EColor.Reset)}`);
     }
 
     head(cle: string, infos?: any ) {
         this.show(infos 
             ? `${this.col(EColor.FgGreen)} ${this.line(4)} ${this.col(EColor.FgCyan)} ${cle} ${this.col(EColor.FgWhite)} ${this.logAll(infos, this.debugFile)} ${this.col(EColor.FgGreen)} ${this.line(4)}${this.col(EColor.Reset)}`
             : this.separator(cle, 4)
             );
     }

     keys(title: string, input: {[key: string]: string}) {
        this.head(title);
        Object.keys(input).forEach((cle: string) => {this.debug(`  ${cle}`, input[cle] ); });
     }

    query(sql: unknown ) {
        this.show(this.separator("Query", 30));
        this.show(`${this.col(EColor.FgCyan)} ${this.logAll(sql)}${this.col(EColor.Reset)}`);
    }

    infos(cle: string, input: unknown ) {
        this.show(this.separator(cle, 30));
        this.show(`${this.col(EColor.FgYellow)} ${this.logAll(input, true)}${this.col(EColor.Reset)}`);
    }

    debug(cle: string, infos?: any ) {
        this.show(`${this.col(EColor.FgGreen)} ${cle} ${this.col(EColor.FgWhite)} : ${this.col(EColor.FgCyan)} ${this.logAll(infos, this.debugFile)}${this.col(EColor.Reset)}`);
    }

    result(cle: string, infos?: any ) {
        this.show(`${this.col(EColor.FgGreen)}     >>${this.col(EColor.FgBlack)} ${cle} ${this.col(EColor.FgMario)} : ${this.col(EColor.FgCyan)} ${this.logAll(infos, this.debugFile)}${this.col(EColor.Reset)}`);
    }

    infoSystem(cle: string, infos?: any ) {
        this.show(`${this.col(EColor.FgCyan)} ${cle} ${this.col(EColor.FgBlue)} : ${this.col(EColor.FgWhite)} ${this.logAll(infos, this.debugFile)}${this.col(EColor.Reset)}`);
    }

    error(cle: unknown, infos?: any ) {
        this.show( infos 
            ? `${this.col(EColor.FgRed)} ${cle} ${this.col(EColor.FgBlue)} : ${this.col(EColor.FgYellow)} ${this.logAll(infos, this.debugFile)}${this.col(EColor.Reset)}`
            : `${this.col(EColor.FgRed)} Error ${this.col(EColor.FgBlue)} : ${this.col(EColor.FgYellow)} ${this.logAll(cle)}${this.col(EColor.Reset)}`);
    }
    
    env( testDebug: boolean, cle: string, infos?: any ) {
        this.show(`${this.col(EColor.FgCyan)} ${cle} ${this.col(EColor.FgBlue)} : ${this.col(EColor.FgYellow)} ${this.logAll(infos, this.debugFile)}${this.col(EColor.Reset)}`);
    }
    class(cle: string, infos?: any ) {
        this.show(infos 
            ? `${this.col(EColor.FgRed)} ${this.line(4)} ${this.col(EColor.FgCyan)} ${cle} ${this.col(EColor.FgYellow)} ${this.logAll(infos, this.debugFile)} ${this.col(EColor.FgRed)} ${this.line(4)}${this.col(EColor.Reset)}`
            : `${this.col(EColor.FgRed)} ${this.line(4)} ${this.col(EColor.FgCyan)} ${cle} ${this.col(EColor.FgRed)} ${this.line(4)}${this.col(EColor.Reset)}`);
    }
    override(cle: string, infos?: any ) {
        this.show(infos 
            ? `${this.col(EColor.FgRed)} ${this.line(4)} ${this.col(EColor.FgGreen)} ${cle} [OVERRIDE]${this.col(EColor.FgYellow)} ${this.logAll(infos, this.debugFile)} ${this.col(EColor.FgRed)} ${this.line(4)}${this.col(EColor.Reset)}`
            : `${this.col(EColor.FgRed)} ${this.line(4)} ${this.col(EColor.FgCyan)} ${cle} ${this.col(EColor.FgRed)} ${this.line(4)}${this.col(EColor.Reset)}`);
    }

    logQuery(input: any, full?: boolean) {
        this.show((full && full == true) ? this.logAll(input) : input);
    }

    writeError(ctx: Koa.Context | undefined, ...data: any[]) {   
        const errFile = fs.createWriteStream("errorFile.md", { flags: 'a' }); 
        if(ctx) {
            errFile.write(`# ${TIMESTAMP()} : ${ctx.request.url}\n`);    
            errFile.write(util.inspect(ctx.request.body, { showHidden: false, depth: null, colors: false }) + '\n');        
            errFile.write(`${this.line(30)}\n`);        
        } else errFile.write(`# ${this.line(10)} ${TIMESTAMP()} ${this.line(10)}\n`);
        errFile.write(util.format.apply(null, data) + '\n');        
    }

    start(cle: string) {
        this.show(`${this.col(EColor.FgRed)} ${this.line(24)} ${this.col(EColor.FgCyan)} ${cle} ${this.col(EColor.FgWhite)} ${new Date().toLocaleDateString()} : ${new Date().toLocaleTimeString()} ${this.col(EColor.FgRed)} ${this.line(24)}${this.col(EColor.Reset)}`);
    }
    end(cle: string) {
        this.show(`${this.col(EColor.FgGreen)} ${this.line(24)} ${this.col(EColor.FgCyan)} ${cle} ${this.col(EColor.FgWhite)} ${new Date().toLocaleDateString()} : ${new Date().toLocaleTimeString()} ${this.col(EColor.FgGreen)} ${this.line(24)}${this.col(EColor.Reset)}`);
    }
}

