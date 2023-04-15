import util from "util";
import { _debug } from "../constants";


export class logs {
    private col = {
        Reset : "\x1b[0m",
        Bright : "\x1b[1m",
        Dim : "\x1b[2m",
        Underscore : "\x1b[4m",
        Blink : "\x1b[5m",
        Reverse : "\x1b[7m",
        Hidden : "\x1b[8m",
        FgBlack : "\x1b[30m",
        FgRed : "\x1b[31m",
        FgGreen : "\x1b[32m",
        FgYellow : "\x1b[33m",
        FgBlue : "\x1b[34m",
        FgMagenta : "\x1b[35m",
        FgCyan : "\x1b[36m",
        FgWhite : "\x1b[37m",
        FgMario : "\x1b[39m",
        FgGray : "\x1b[90m",
        BgBlack : "\x1b[40m",
        BgRed : "\x1b[41m",
        BgGreen : "\x1b[42m",
        BgYellow : "\x1b[43m",
        BgBlue : "\x1b[44m",
        BgMagenta : "\x1b[45m",
        BgCyan : "\x1b[46m",
        BgWhite : "\x1b[47m",
        BgGray : "\x1b[100m",
    };
    private debugFile = false;

    line(nb: number) {
        return '='.repeat(nb);
    }

    separator(title: string, nb: number) {
        return `${this.col.FgGreen} ${this.line(nb)} ${this.col.FgYellow} ${title} ${this.col.FgGreen} ${this.line(nb)}${this.col.Reset}`;
    }

     show(input: string) {
         if (!_debug) return;
        console.log(input);
     }

     logAll(input: any, colors?: boolean) { 
        return util.inspect(input, { showHidden: false, depth: null, colors: colors || false }); 
    }

     booting(cle: string, value: string | number) {
         this.show(`${this.col.FgYellow} ${this.line(12)} ${this.col.FgCyan} ${cle} ${this.col.FgWhite} ${this.logAll(value, this.debugFile)} ${this.col.FgYellow} ${this.line(12)}${this.col.Reset}`);
     }
 
     head(cle: string, infos?: any ) {
         this.show(infos 
             ? `${this.col.FgGreen} ${this.line(4)} ${this.col.FgCyan} ${cle} ${this.col.FgWhite} ${this.logAll(infos, this.debugFile)} ${this.col.FgGreen} ${this.line(4)}${this.col.Reset}`
             : this.separator(cle, 4)
             );
     }

    query(sql: unknown ) {
        this.show(this.separator("Query", 30));
        this.show(`${this.col.FgCyan} ${this.logAll(sql)}${this.col.Reset}`);
    }

    infos(cle: string, input: unknown ) {
        this.show(this.separator(cle, 30));
        this.show(`${this.col.FgYellow} ${this.logAll(input, true)}${this.col.Reset}`);
    }

    debug(cle: string, infos?: any ) {
        this.show(`${this.col.FgGreen} ${cle} ${this.col.FgWhite} : ${this.col.FgCyan} ${this.logAll(infos, this.debugFile)}${this.col.Reset}`);
    }

    result(cle: string, infos?: any ) {
        this.show(`${this.col.FgGreen}     >>${this.col.FgBlack} ${cle} ${this.col.FgMario} : ${this.col.FgCyan} ${this.logAll(infos, this.debugFile)}${this.col.Reset}`);
    }

    infoSystem(cle: string, infos?: any ) {
        this.show(`${this.col.FgCyan} ${cle} ${this.col.FgBlue} : ${this.col.FgWhite} ${this.logAll(infos, this.debugFile)}${this.col.Reset}`);
    }

    error(cle: unknown, infos?: any ) {
        this.show( infos 
            ? `${this.col.FgRed} ${cle} ${this.col.FgBlue} : ${this.col.FgYellow} ${this.logAll(infos, this.debugFile)}${this.col.Reset}`
            : `${this.col.FgRed} Error ${this.col.FgBlue} : ${this.col.FgYellow} ${this.logAll(cle)}${this.col.Reset}`);
    }
    
    env( testDebug: boolean, cle: string, infos?: any ) {
        this.show(`${this.col.FgCyan} ${cle} ${this.col.FgBlue} : ${this.col.FgYellow} ${this.logAll(infos, this.debugFile)}${this.col.Reset}`);
    }
    class(cle: string, infos?: any ) {
        this.show(infos 
            ? `${this.col.FgRed} ${this.line(4)} ${this.col.FgCyan} ${cle} ${this.col.FgYellow} ${this.logAll(infos, this.debugFile)} ${this.col.FgRed} ${this.line(4)}${this.col.Reset}`
            : `${this.col.FgRed} ${this.line(4)} ${this.col.FgCyan} ${cle} ${this.col.FgRed} ${this.line(4)}${this.col.Reset}`);
    }
    override(cle: string, infos?: any ) {
        this.show(infos 
            ? `${this.col.FgRed} ${this.line(4)} ${this.col.FgGreen} ${cle} [OVERRIDE]${this.col.FgYellow} ${this.logAll(infos, this.debugFile)} ${this.col.FgRed} ${this.line(4)}${this.col.Reset}`
            : `${this.col.FgRed} ${this.line(4)} ${this.col.FgCyan} ${cle} ${this.col.FgRed} ${this.line(4)}${this.col.Reset}`);
    }

    logQuery(input: any, full?: boolean) {
        this.show((full && full == true) ? this.logAll(input) : input);
    }
}

