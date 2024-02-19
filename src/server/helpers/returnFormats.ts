/**
 * returnFormats.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { queryAsDataArray, queryAsJson, queryGraphDatastream, queryGraphMultiDatastream, queryInterval, } from "../db/queries";
import { Parser } from "json2csv";
import koa from "koa";
import { IreturnFormat } from "../types";
import { addCssFile } from "../views/css";
import { addJsFile } from "../views/js";
import util from "util";
import { PgVisitor } from "../odata";
import { Eformats } from "../enums";
import { isGraph } from ".";
import { DOUBLEQUOTEDCOMA } from "../constants";
import { log } from "../log";

// Default "blank" function
const defaultFunction = (input: string | object) => input;
// Default "blank" format function
const defaultForwat = (input: PgVisitor): string => input.sql;

const generateFields = (input: PgVisitor): string[] => {
  let fields: string[] = [];
  if (isGraph(input)) {
    const table = input.ctx.model[input.parentEntity ? input.parentEntity : input.entity].table;
    fields = [
      `(SELECT ${table}."description" FROM ${table} WHERE ${table}."id" = ${
        input.parentId ? input.parentId : input.id
      }) AS title, `,
    ];
  }
  return fields;
};

/**
 * 
 * @param input PgVisitor
 * @returns sSQL Query for graph
 */
const generateGrahSql = (input: PgVisitor): string => {
  input.intervalColumns = ["id", "step as date", "result"];
  if (isGraph(input)) input.intervalColumns.push("concat"); 
  const table = input.ctx.model[input.parentEntity ? input.parentEntity : input.entity].table;
  const id = input.parentId ? input.parentId : input.id;
  return queryAsJson({
    query:
      table === input.ctx.model.Datastreams.table
        ? queryGraphDatastream(table, id, queryInterval(input))
        : queryGraphMultiDatastream( table, id, input.splitResult, queryInterval(input) ),
    singular: false,
    count: false,
  });
};

// all returns format functions
const _returnFormats: { [key in Eformats]: IreturnFormat } = {
  xlsx: {
    name: "xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    format: defaultFunction,
    generateSql: defaultForwat,
  }, 

  // IMPORTANT TO HAVE THIS BEFORE GRAPH
  json: {
    name: "json",
    type: "application/json",
    format: defaultFunction,
    generateSql(input: PgVisitor) {
      return input.interval
        ? queryAsJson({ query: queryInterval(input), singular: false, count: true })
        : queryAsJson({
            query: input.sql,
            singular: false,
            count: true,
            fullCount: input.count === true ? input.ctx.model[input.entity].count : undefined,
            fields: generateFields(input),
          });
    },
  }, 
  
  // IMPORTANT TO HAVE THIS BEFORE GRAPH
  graphDatas: {
    name: "graphDatas",
    type: "application/json",
    format: defaultFunction,
    generateSql(input: PgVisitor) { return generateGrahSql(input); },
  },

  graph: {
    name: "graph",
    type: "text/html;charset=utf8",
    format(input: string | object, ctx: koa.Context): string | object {
      const graphNames: string[] = [];
      const formatedDatas: string[] = [];
      const height = String(100 / Object.entries(input).length).split(".")[0];
      if (typeof input === "object") {
        Object.entries(input).forEach((element: object, index: number) => {
          graphNames.push( `<button type="button" id="btngraph${index}" onclick="graph${index}.remove(); btngraph${index}.remove()"">X</button> <div id="graph${index}" style="width:95%; height:${height}%;"></div>` );
          const infos = element[1]["description"]
            ? `${[
                element[1]["description"],
                element[1]["name"],
                element[1]["symbol"],
              ].join('","')}`
            : `${element[1]["infos"].split("|").join(DOUBLEQUOTEDCOMA)}`;
          const formatedData = `const value${index} = [${element[1]["datas"]}]; 
          const infos${index} = ["${infos}"];`;
          formatedDatas.push(` ${formatedData} showGraph("graph${index}", infos${index}, value${index})`);
        });
      }
      return `<html lang="fr"> <head>
      <style>${addCssFile("dygraph.css")}</style> <!-- htmlmin:ignore --><script>${addJsFile( "dygraph.js" )}</script><!-- htmlmin:ignore -->
      ${graphNames.join("")}
        <script>
        ${addJsFile("graph.js")}
          const linkBase = "${ctx.decodedUrl.root}";
          ${formatedDatas.join("")}                             
        </script>`;
    },
    generateSql(input: PgVisitor) {
      return generateGrahSql(input);
    },
  },

  dataArray: {
    name: "dataArray",
    type: "application/json",
    format: defaultFunction,
    generateSql(input: PgVisitor) {
      return queryAsDataArray(input);
    },
  },

  csv: {
    name: "csv",
    type: "text/csv",
    format: (input: string | object) => {
      const opts = {
        delimiter: ";",
        includeEmptyRows: true,
        escapedQuote: "",
        header: false,
      };
      if (input && input[0].dataArray)
        try {
          const parser = new Parser(opts);
          input[0].dataArray.unshift(input[0].component);
          return parser.parse(input[0].dataArray);
        } catch (e) {
          if (e instanceof Error) {
            log.errorMsg(e);
            return e.message;
          }
        }
      return "No datas";
    },
    generateSql(input: PgVisitor) {
      return queryAsDataArray(input);
    },
  },

  txt: {
    name: "txt",
    type: "text/plain",
    format: (input: string | object) =>
      Object.entries(input).length > 0
        ? util.inspect(input, { showHidden: true, depth: 4 })
        : JSON.stringify(input),
    generateSql(input: PgVisitor) {
      return queryAsJson({ query: input.sql, singular: false, count: false });
    },
  },

  sql: {
    name: "sql",
    type: "text/plain",
    format: defaultFunction,
    generateSql: defaultForwat,
  },

  html: {
    name: "html",
    type: "text/html;charset=utf8",
    format: defaultFunction,
    generateSql: defaultForwat,
  },

  css: {
    name: "css",
    type: "text/css;charset=utf8",
    format: defaultFunction,
    generateSql: defaultForwat,
  },

  js: {
    name: "js",
    type: "application/javascript;charset=utf8",
    format: defaultFunction,
    generateSql: defaultForwat,
  },

  png: {
    name: "png",
    type: "image/png",
    format: defaultFunction,
    generateSql: defaultForwat,
  },

  jpeg: {
    name: "jpeg",
    type: "image/jpeg",
    format: defaultFunction,
    generateSql: defaultForwat,
  },
  jpg: {
    name: "jpg",
    type: "image/jpeg",
    format: defaultFunction,
    generateSql: defaultForwat,
  },

  icon: {
    name: "icon",
    type: "image/x-icon",
    format: defaultFunction,
    generateSql: defaultForwat,
  },

  ico: {
    name: "ico",
    type: "image/x-icon",
    format: defaultFunction,
    generateSql: defaultForwat,
  },
  
  xml: {
    name: "xml",
    type: "application/xml",
    format: defaultFunction,
    generateSql: defaultForwat,
  },
};

export const returnFormats = Object.freeze(_returnFormats);
