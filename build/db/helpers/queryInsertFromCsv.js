"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.queryInsertFromCsv=void 0;const logger_1=require("../../logger"),_1=require("."),constants_1=require("../../constants");async function queryInsertFromCsv(r,s){const o=await(0,_1.columnsNameFromHydrasCsv)(s);if(o){var e=await(0,_1.streamCsvFile)(r,s,o);if(0<e){const a=s.filename.split("/").reverse()[0],n=(new Date).toLocaleString(),u=[];return Object.keys(s.columns).forEach((e,t)=>{e=s.columns[e];u.push(`INSERT INTO "${r.model.Observations.table}" 
          ("${e.stream.type?.toLowerCase()}_id", "featureofinterest_id", "phenomenonTime", "resultTime", "result", "resultQuality")
            SELECT 
            ${e.stream.id}, 
            ${e.stream.FoId},  
            ${o.dateSql}, 
            ${o.dateSql},
            json_build_object('value', 
            CASE "${s.tempTable}".value${e.column}
              WHEN '---' THEN NULL 
              ELSE CAST(REPLACE(value${e.column},',','.') AS float) 
            END),
            '{"import": "${a}","date": "${n}"}'  
           FROM "${s.tempTable}" ON CONFLICT DO NOTHING returning 1`)}),{count:e,query:u}}}}exports.queryInsertFromCsv=queryInsertFromCsv;