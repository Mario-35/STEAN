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
import { removeQuotes } from ".";

export const queryAsJson = (query: string, singular: boolean, count: boolean, fields?: string[]): string => {  
  const returnJson: string = singular === true ? "ROW_TO_JSON" : "json_agg";
  const returnNull: string = singular === true ? "{}" : "[]";
  return `SELECT ${count == true ? "\n\tcount(t),\n\t" : ""} ${fields ? fields.join(",\n\t") : ""}coalesce(${returnJson}(t), '${returnNull}') AS results\n\tFROM (${query}) as t`;
};

const  queryAsStep = (query: string, interval: string | undefined): string => {
  return queryAsJson(interval 
      ? `\nWITH src as (\n${query}), \n\trange_values AS (SELECT \n\t\tmin(src.date) as minval, \n\t\tmax(src.date) as maxval \n\tFROM src), \n\ttime_range AS (SELECT \n\t\tgenerate_series(minval::timestamp, maxval::timestamp , '${interval || "1 day"}'::interval)::TIMESTAMP WITHOUT TIME ZONE as step \n\tFROM range_values) \n\tSELECT id, \n\t\tstep as date, \n\t\tresult FROM src \n\t\tRIGHT JOIN time_range on date = step`
      : query, false, true)
};

const  queryAsDataArray = (listOfKeys: { [key: string]: string } , query: string, singular: boolean, fields?: string[]): string => {    
  const sqlString = `SELECT (ARRAY['${Object.keys(listOfKeys).map((e:string) => removeQuotes(e)).join("','")}']) as "component", count(*) as "dataArray@iot.count", jsonb_agg(allkeys) as "dataArray" FROM (SELECT  json_build_array(${Object.values(listOfKeys).join()}) as allkeys FROM (${query}) as p) as l`;
  return queryAsJson(sqlString, singular, false, fields);
}

const defaultFunction = (input: string | Object, ctx?: koa.Context) => input;
const defaultForwat = (arr: {[key: string]: any}): string => arr["query"];
const _returnFormats: { [key in FORMATS]: IreturnFormat } = {
  json: {
      name : "json",
      type: "application/json",
      format : defaultFunction,
      generateSql(arr: {[key: string]: any}) { 
        return queryAsJson(arr["query"] , arr["singular"] , arr["count"] , arr["fields"]);
      },
    },  // IMPORTANT TO HAVE THIS BEFORE GRAPH
    graphDatas: {
      name : "graphDatas",
      type: "application/json",
      format : defaultFunction,
      generateSql(arr: {[key: string]: any}) { 
        return queryAsStep(arr["query"], arr["interval"])
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
      generateSql(arr: {[key: string]: any}) { 
        return queryAsStep(arr["query"], arr["interval"])
      },
    },
    dataArray: {
            name : "dataArray",
      type: "application/json",
      format : defaultFunction,      
      generateSql(arr: {[key: string]: any}) {         
        return queryAsDataArray(arr["listOfKeys"], arr["query"] , arr["singular"] , arr["fields"]);
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
                    message(false, "ERROR", e.message);
                    return e.message;
                }
              }
              return "No datas";
      },
      generateSql(arr: {[key: string]: any}) { return `
WITH one AS (
    SELECT  coalesce(json_agg(t), '[]') AS results
    FROM (
        SELECT (string_to_array(replace((SELECT "unitOfMeasurement"->'name' 
                                        FROM "datastream" 
                                        WHERE id = ${arr["id"]})::text,'"',''), ','))  AS "component", 
        count(*) as "dataArray@iot.count", 
        jsonb_agg(allkeys) AS "dataArray" FROM (SELECT "result" AS "allkeys" 
        FROM (
            SELECT "id", "observation"."_resulttexts" AS "result"
            FROM "observation"
            WHERE "observation"."id" IN (
                SELECT "observation"."id" 
                FROM "observation" 
                WHERE "observation"."datastream_id" = 15 
                ORDER BY "observation"."resultTime" ASC)
            ORDER BY "observation"."phenomenonTime",  "observation"."id") 
        AS p) 
    AS l) 
AS t),

two AS (
    ${queryAsDataArray(arr["listOfKeys"], arr["query"], false, arr["fields"])}
)
SELECT
    CASE
        WHEN (SELECT "observationType" FROM "datastream" WHERE id = ${arr["id"]}) = 'SWE Array Observation' 
        THEN (SELECT * FROM one)
        ELSE (SELECT * FROM two)
    END 

`}
    },
    txt: {
      name : "txt",
      type: "text/plain",
      format :(input: string | Object, ctx?: koa.Context) => Object.entries(input).length > 0 ? util.inspect(input, { showHidden: true, depth: 4 }) : JSON.stringify(input),
      generateSql(arr: {[key: string]: any}) { 
        return queryAsJson(arr["query"] , arr["singular"] , arr["count"] , arr["fields"]);
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