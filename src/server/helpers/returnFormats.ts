/**
 * returnFormats.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */


import { Parser } from "json2csv";
import koa from "koa";
import { message } from "../logger";
import { FORMATS, IreturnFormat } from "../types";
import { cssFile } from "../views/css";
import { jsFile } from "../views/js";
import util from "util";


const defaultFunction = (input: string | Object, ctx?: koa.Context) => input;
const _returnFormats: { [key in FORMATS]: IreturnFormat } = {
    json: {
      type: "application/json",
      format : defaultFunction,
    },  // IMPORTANT TO HAVE THIS BEFORE GRAPH
    graphDatas: {
      type: "application/json",
      format : defaultFunction,
    },
    graph: {
      type: "text/html;charset=utf8",
      format(input: string | Object, ctx: koa.Context): string | Object {
        const edit = "async function editDataClicked(id, params) { new Observation({ title: `${params.seriesName}`, date: params.name, value : params.data.toString(), id: id }); } ";
        return `<!DOCTYPE text/html>
                    <html lang="fr">
                        <head>
                            <style>${cssFile("query.css")}</style>
                            <!-- htmlmin:ignore --><script>${jsFile("echarts.js")}</script><!-- htmlmin:ignore -->
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
      },
    },
    dataArray: {
      type: "application/json",
      format : defaultFunction,
    },
    csv: {
      type: "text/csv",
      format :(input: string | Object) => {
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
      },
    },
    txt: {
      type: "text/plain",
      format :(input: string | Object, ctx?: koa.Context) => Object.entries(input).length > 0 ? util.inspect(input, { showHidden: true, depth: 4 }) : JSON.stringify(input),
    },
    sql: {
      type: "text/plain",
      format : defaultFunction,
    },
    html: {
      type: "text/html;charset=utf8",
      format : defaultFunction,
    },
    css: {
      type: "text/css;charset=utf8",
      format : defaultFunction,
    },
    js: {
      type: "application/javascript;charset=utf8",
      format : defaultFunction,
    },
    png: {
      type: "image/png",
      format : defaultFunction,
    },
    jpeg: {
      type: "image/jpeg",
      format : defaultFunction,
    },
    jpg: {
      type: "image/jpeg",
      format : defaultFunction,
    },
    icon: {
      type: "image/x-icon",
      format : defaultFunction,
    },
    ico: {
      type: "image/x-icon",
      format : defaultFunction,
    }
};

export const returnFormats = Object.freeze(_returnFormats);