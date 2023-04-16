/**
 * returnFormats.
*
* @copyright 2020-present Inrae
* @author mario.adam@inrae.fr
*
*/


import { Parser } from "json2csv";
import koa from "koa";
import { Logs } from "../logger";
import { IreturnFormat } from "../types";
import { addCssFile } from "../views/css";
import { addJsFile } from "../views/js";
import util from "util";
import { removeQuotes } from ".";
import { PgVisitor } from "../odata";
import { countId, isGraph, _DBDATAS } from "../db/constants";
import { Eformats } from "../enums";

export const queryAsJson = (input: {
    query: string;
    singular: boolean;
    count: boolean;
    mario?: string;
    fields?: string[]
  }): string => `SELECT ${input.count == true ? `\t${input.mario ? `(${input.mario})` : 'count(t)'},\n\t` : ""}${input.fields ? input.fields.join(",\n\t") : ""}coalesce(${input.singular === true ? "ROW_TO_JSON" : "json_agg"}(t), '${input.singular === true ? "{}" : "[]"}') AS results\n\tFROM (\n\t${input.query}) as t`;

const queryAsDataArray = (input: PgVisitor): string => queryAsJson({query: `SELECT (ARRAY['${Object.keys(input.arrayNames).map((e:string) => removeQuotes(e)).join("','")}']) as "component", count(*) as "dataArray@iot.count", jsonb_agg(allkeys) as "dataArray" FROM (SELECT  json_build_array(${Object.values(input.arrayNames).join()}) as allkeys FROM (${input.sql}) as p) as l`, singular: false, count: false});

const queryInterval = (input: PgVisitor): string => {
  input.sql = input.interval 
      ? `WITH src as (\n\t${input.sql}), \n\trange_values AS (SELECT \n\t\tmin(srcdate) as minval, \n\t\tmax(srcdate) as maxval \n\tFROM src), \n\ttime_range AS (SELECT \n\t\tgenerate_series(minval::timestamp, maxval::timestamp , '${input.interval || "1 day"}'::interval)::TIMESTAMP WITHOUT TIME ZONE as step \n\tFROM range_values) \n\tSELECT ${input.blanks ? input.blanks.join(", \n\t") : ''} FROM src \n\t\tRIGHT JOIN time_range on srcdate = step`
      : input.sql;
  return queryAsJson({query: input.sql, singular: false, count: true});
};

const defaultFunction = (input: string | object) => input;
const defaultForwat = (input: PgVisitor): string => input.sql;
const generateFields = (input: PgVisitor): string[] => {
  let fields:string[] = [];
  if (isGraph(input)) {    
    const table = _DBDATAS[input.parentEntity ? input.parentEntity: input.getEntity()].table;
    fields = [`(select ${table}."description" from ${table} where ${table}."id" = ${input.parentId ? input.parentId: input.id}) AS title, `];
  } 
  return fields;
};
const _returnFormats: { [key in Eformats]: IreturnFormat } = {
  json: {
    name : "json",
    type: "application/json",
    format : defaultFunction,
    generateSql(input: PgVisitor) {      
    return (input.interval) 
      ? queryInterval(input)
      : queryAsJson({query: input.sql, singular: false, count: true, mario: input.count === true ? countId(_DBDATAS[input.entity].table) : undefined, fields: generateFields(input)});
    },
  }, // IMPORTANT TO HAVE THIS BEFORE GRAPH
  graphDatas: {
    name : "graphDatas",
    type: "application/json",
    format : defaultFunction,
    generateSql(input: PgVisitor) { 
      input.blanks = ["id", "step as date", "result"];
      return queryInterval(input);
    },
  },
  graph: {
    name : "graph",
    type: "text/html;charset=utf8",
    format(input: string | object, ctx: koa.Context): string | object {
      const edit = "async function editDataClicked(id, params) { new Observation({ title: `${params.seriesName}`, date: params.name, value : params.data.toString(), id: id }); } ";
      return `<!DOCTYPE text/html>
                <html lang="fr">
                    <head>
                      <style>${addCssFile("query.css")}</style>
                        <!-- htmlmin:ignore --><script>${addJsFile("echarts.js")}</script><!-- htmlmin:ignore -->
                      <script>${addJsFile("modal.js")}</script>
                    </head>
                    <body>
                      <div id="graphContainer" style="background-color: rgb(240, 242, 243);">
                        <div id="graph" style="width:100%; height:100%;">
                        </div>
                      </div>
                      <script>
                        const linkBase = "${ctx._linkBase}/${ctx._version}";
                        const value = ${JSON.stringify(input, null, 2)};
                        ${addJsFile("graph.js")}
                        showGraph(value);
                        ${edit}                              
                      </script>
                    </body>
                </html>`;  
    }, 
    generateSql(input: PgVisitor) { 
      input.blanks = ["id", "step as date", "result"];
      return queryInterval(input);
    },
  },
  dataArray: {
    name : "dataArray",
    type: "application/json",
    format : defaultFunction,      
    generateSql(input: PgVisitor) {        
      return queryAsDataArray(input);
    }
  },
  csv: {
    name : "csv",
    type: "text/csv",
    format :(input: string | object) => {
      const opts = { delimiter: ";", includeEmptyRows: true, escapedQuote: "",header: false};            
      if (input && input[0].dataArray)
      try {
        const parser = new Parser(opts);
        input[0].dataArray.unshift(input[0].component);
        return parser.parse(input[0].dataArray);
      } catch (e) {
        if (e instanceof Error) {
                  Logs.error(e.message);
                  return e.message;
              }
            }
            return "No datas";
    },
    generateSql(input: PgVisitor) { 
    return queryAsDataArray(input);}
  },
  txt: {
    name : "txt",
    type: "text/plain",
    format :(input: string | object) => Object.entries(input).length > 0 ? util.inspect(input, { showHidden: true, depth: 4 }) : JSON.stringify(input),
    generateSql(input: PgVisitor) {  
      return queryAsJson({query: input.sql, singular: false, count: false});
    },
  },
  sql: {
    name : "sql",
    type: "text/plain",
    format : defaultFunction,
    generateSql:defaultForwat,
  },
  html: {
    name : "html",
    type: "text/html;charset=utf8",
    format : defaultFunction,
    generateSql:defaultForwat,
  },
  css: {
    name : "css",
    type: "text/css;charset=utf8",
    format : defaultFunction,
    generateSql:defaultForwat,
  },
  js: {
    name : "js",
    type: "application/javascript;charset=utf8",
    format : defaultFunction,
    generateSql:defaultForwat,
  },
  png: {
    name : "png",
    type: "image/png",
    format : defaultFunction,
    generateSql:defaultForwat,
  },
  jpeg: {
    name : "jpeg",
    type: "image/jpeg",
    format : defaultFunction,
    generateSql:defaultForwat,
  },
  jpg: {
          name : "jpg",
          type: "image/jpeg",
          format : defaultFunction,
    generateSql:defaultForwat,
  },
  icon: {
    name : "icon",
    type: "image/x-icon",
    format : defaultFunction,
    generateSql:defaultForwat,
  },
  ico: {
    name : "ico",
    type: "image/x-icon",
    format : defaultFunction,
    generateSql:defaultForwat,
  }
};

export const returnFormats = Object.freeze(_returnFormats);