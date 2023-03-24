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
import { FORMATS, IreturnFormat, MODES } from "../types";
import { addCssFile } from "../views/css";
import { addJsFile } from "../views/js";
import util from "util";
import { removeQuotes } from ".";
import { PgVisitor } from "../odata";
import { isGraph, _DBDATAS } from "../db/constants";

export const queryAsJson = (input: {
    query: string;
    singular: boolean;
    count: boolean;
    fields?: string[]
  }): string => `SELECT ${input.count == true ? "\tcount(t),\n\t" : ""}${input.fields ? input.fields.join(",\n\t") : ""}coalesce(${input.singular === true ? "ROW_TO_JSON" : "json_agg"}(t), '${input.singular === true ? "{}" : "[]"}') AS results\n\tFROM (\n\t${input.query}) as t`;;
  
const  queryAsDataArray = (input: PgVisitor): string => queryAsJson({query: `SELECT (ARRAY['${Object.keys(input.ArrayNames).map((e:string) => removeQuotes(e)).join("','")}']) as "component", count(*) as "dataArray@iot.count", jsonb_agg(allkeys) as "dataArray" FROM (SELECT  json_build_array(${Object.values(input.ArrayNames).join()}) as allkeys FROM (${input.sql}) as p) as l`, singular: false, count: false});

const  queryInterval = (input: PgVisitor): string => {
  input.sql = input.interval 
      ? `\nWITH src as (\n${input.sql}), \n\trange_values AS (SELECT \n\t\tmin(srcdate) as minval, \n\t\tmax(srcdate) as maxval \n\tFROM src), \n\ttime_range AS (SELECT \n\t\tgenerate_series(minval::timestamp, maxval::timestamp , '${input.interval || "1 day"}'::interval)::TIMESTAMP WITHOUT TIME ZONE as step \n\tFROM range_values) \n\tSELECT ${input.blanks ? input.blanks.join(", \n\t") : ''} FROM src \n\t\tRIGHT JOIN time_range on srcdate = step`
      : input.sql;
  return queryAsJson({query: input.sql, singular: false, count: false});
};

const defaultFunction = (input: string | Object, ctx?: koa.Context) => input;
const defaultForwat = (arr: {[key: string]: any}): string => arr["query"];
const generateFields = (input: PgVisitor): string[] => {
  let fields:string[] = [];
  if (isGraph(input)) {    
    const table = _DBDATAS[input.parentEntity ? input.parentEntity: input.getEntity()].table;
    fields =  [`(select ${table}."description" from ${table} where ${table}."id" = ${input.parentId ? input.parentId: input.id}) AS title, `];
  } 
  return fields;
};
const _returnFormats: { [key in FORMATS]: IreturnFormat } = {
  json: {
    name : "json",
    type: "application/json",
    format : defaultFunction,
    generateSql(input: PgVisitor) {      
    return (input.interval) 
      ? queryInterval(input)
      : queryAsJson({query: input.sql, singular: false, count: true, fields: generateFields(input)});
    },
  },  // IMPORTANT TO HAVE THIS BEFORE GRAPH
  graphDatas: {
    name : "graphDatas",
    type: "application/json",
    format : defaultFunction,
    generateSql(input: PgVisitor) { 
      input.blanks = ["id", "step as date", "result"]
      return queryInterval(input);
    },
  },
  graph: {
    name : "graph",
    type: "text/html;charset=utf8",
    format(input: string | Object, ctx: koa.Context): string | Object {
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
      input.blanks = ["id", "step as date", "result"]
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
    format :(input: string | Object) => {
      const opts = { delimiter: ";", includeEmptyRows: true, escapedQuote: "",header: false};            
      if (input && input[0].dataArray)
      try {
        const parser = new Parser(opts);
        input[0].dataArray.unshift(input[0].component);
        return parser.parse(input[0].dataArray);
      } catch (e) {
        if (e instanceof Error) {
                  message(false, MODES.ERROR, e.message);
                  return e.message;
              }
            }
            return "No datas";
    },
    generateSql(input: PgVisitor) { 
    return `WITH one AS (
          SELECT  coalesce(json_agg(t), '[]') AS results
          FROM (
              SELECT (string_to_array(replace((SELECT "unitOfMeasurement"->'name' 
                                              FROM "datastream" 
                                              WHERE id = ${input.parentId})::text,'"',''), ','))  AS "component", 
              count(*) as "dataArray@iot.count", 
              jsonb_agg(allkeys) AS "dataArray" FROM (SELECT "result" AS "allkeys" 
              FROM (
                  SELECT "id", "observation"."_resulttexts" AS "result"
                  FROM "observation"
                  WHERE "observation"."id" IN (
                      SELECT "observation"."id" 
                      FROM "observation" 
                      WHERE "observation"."datastream_id" = ${input.parentId} 
                      ORDER BY "observation"."resultTime" ASC)
                  ORDER BY "observation"."phenomenonTime",  "observation"."id") 
              AS p) 
          AS l) 
      AS t),
      two AS (
          ${queryAsDataArray(input)}
      )
      SELECT
          CASE
              WHEN (SELECT "observationType" FROM "datastream" WHERE id = ${input.parentId}) = 'http://www.opengis.net/def/observation-type/ogc-omxml/2.0/swe-array-observation' 
              THEN (SELECT * FROM one)
              ELSE (SELECT * FROM two)
          END 
    `}
  },
  txt: {
    name : "txt",
    type: "text/plain",
    format :(input: string | Object, ctx?: koa.Context) => Object.entries(input).length > 0 ? util.inspect(input, { showHidden: true, depth: 4 }) : JSON.stringify(input),
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