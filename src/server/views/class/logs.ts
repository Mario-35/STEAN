/**
 * HTML Views Error for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- HTML Views Error for API. -----------------------------------!");
import { koaContext } from "../../types";
import { CoreHtmlView } from "./core";
import fs from "fs";
import path from "path";
var Convert = require('ansi-to-html');
    export class HtmlLogs extends CoreHtmlView {
        
    constructor(ctx: koaContext, datas: string) {
        const fileContent = fs.readFileSync(path.resolve(__dirname, "../../logs.txt"), "utf8");
        super(ctx);
        this.logs(fileContent);
    }

    private logs(message: string) {
        var convert = new Convert({
            fg: '#FFF',
            bg: '#000',
            newline: true,
            escapeXML: false,
            stream: false
        });

        this._HTMLResult = [`
        <!DOCTYPE html>
            <html>
            <body style="background-color:black;">
                ${convert.toHtml(message)}

                    </body>
                </html>`];
    };
  }
