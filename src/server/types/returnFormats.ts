/**
 * returnFormats interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import util from "util";
import { Parser } from "json2csv";
import { message } from "../logger";
import { IKeyValues } from ".";
import koa from "koa";
import { cssFile } from "../views/css";
import { jsFile } from "../views/js";

const enum Formats {    
    json = "json", 
    csv = "csv",
    txt = "txt", 
    html = "html", 
    icon = "icon", 
    graph = "graph", 
    graphDatas = "graphDatas", 
    dataArray = "dataArray", 
    css = "css", 
    js = "js", 
    png = "png", 
    jpg = "jpg", 
    jpeg = "jpeg", 
    ico = "ico"
}

 export interface IreturnFormat {
    name: string; 
    type: string; 
    format(input: string | IKeyValues | IKeyValues[], ctx?: koa.Context): string | IKeyValues | IKeyValues[];
}

export const returnFormats:{ [key in Formats]: IreturnFormat } = {
    json: {
      name: "json",
      type: "application/json",
      format :(input: string | IKeyValues | IKeyValues[], ctx?: koa.Context) => input
    },
    graph: {
      name: "graph",
      type: "text/html;charset=utf8",
      format(input: string | IKeyValues | IKeyValues[], ctx: koa.Context): string | IKeyValues | IKeyValues[] {
        const edit = "async function editDataClicked(id, params) { new Observation({ title: `${params.seriesName}`, date: params.name, value : params.data.toString(), id: id }); } ";
        return `<!DOCTYPE text/html>
                    <html lang="fr">
                        <head>
                            <style>${cssFile("query.css")}</style>
                            <!-- htmlmin:ignore --><script>${jsFile("echarts.min.js")}</script><!-- htmlmin:ignore -->
                            <script>${jsFile("modal.js")}</script>
                        </head>
    
                        <body>
                            <div id="graphContainer" style="background-color: rgb(240, 242, 243);">
                                <div id="graph" style="width:100%; height:100%;"></div>
                            </div>
                            <script>
                                const linkBase = "${ctx._linkBase}/${ctx._version}";
                                const value = ${JSON.stringify(input, null, 2)};
                                ${jsFile("graph.js")}
                                showGraph(value);
                                ${edit}                              
                            </script>
                        </body>
                    </html>`;  
      }
    },
    graphDatas: {
      name: "graphDatas",
      type: "application/json",
      format :(input: string | IKeyValues | IKeyValues[], ctx?: koa.Context) => input
    },
    dataArray: {
      name: "dataArray",
      type: "application/json",
      format :(input: string | IKeyValues | IKeyValues[], ctx?: koa.Context) => input
    },
    csv: {
      name: "csv",
      type: "text/csv",
      format :(input: string | IKeyValues | IKeyValues[]) => {
        const opts = { delimiter: ";", includeEmptyRows: true, escapedQuote: "",header: false};            
        if (input)
        try {
            const parser = new Parser(opts);
                input[0].dataArray.unshift(input[0].component);
                return parser.parse(input[0].dataArray);
            } catch (e) {
                if (e instanceof Error) {
                    message(false, "ERROR", e.message);
                    return e.message;
                }
            }
        return "No datas";
      }
    },
    txt: {
      name: "txt",
      type: "text/plain",
      format :(input: string | IKeyValues | IKeyValues[], ctx?: koa.Context) => input.length > 0 ? util.inspect(input, { showHidden: true, depth: 4 }) : JSON.stringify(input)
    },
    html: {
      name: "html",
      type: "text/html;charset=utf8",
      format :(input: string | IKeyValues | IKeyValues[], ctx?: koa.Context) => input
    },
    css: {
      name: "css",
      type: "text/css;charset=utf8",
      format :(input: string | IKeyValues | IKeyValues[], ctx?: koa.Context) => input
    },
    js: {
      name: "js",
      type: "application/javascript;charset=utf8",
      format :(input: string | IKeyValues | IKeyValues[], ctx?: koa.Context) => input
    },
    png: {
      name: "png",
      type: "image/png",
      format :(input: string | IKeyValues | IKeyValues[], ctx?: koa.Context) => input
    },
    jpeg: {
      name: "jpeg",
      type: "image/jpeg",
      format :(input: string | IKeyValues | IKeyValues[], ctx?: koa.Context) => input
    },
    jpg: {
      name: "jpg",
      type: "image/jpeg",
      format :(input: string | IKeyValues | IKeyValues[], ctx?: koa.Context) => input
    },
    icon: {
      name: "icon",
      type: "image/x-icon",
      format :(input: string | IKeyValues | IKeyValues[], ctx?: koa.Context) => input
    },
    ico: {
      name: "ico",
      type: "image/x-icon",
      format :(input: string | IKeyValues | IKeyValues[], ctx?: koa.Context) => input
    }
  }