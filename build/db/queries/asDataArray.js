"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.asDataArray=void 0;const _1=require("."),constants_1=require("../../constants"),helpers_1=require("../../helpers"),asDataArray=s=>{const e=s.toPgQuery()?.keys.map(s=>(0,helpers_1.removeAllQuotes)(s))||[];return s.includes&&s.includes.forEach(s=>{e.push(s.entity)}),(0,_1.asJson)({query:`SELECT (ARRAY[${constants_1._NEWLINE}	${e.map(s=>(0,helpers_1.addSimpleQuotes)((0,constants_1.ESCAPE_SIMPLE_QUOTE)(s))).join(`,${constants_1._NEWLINE}	`)}]) AS "component", count(*) AS "dataArray@iot.count", jsonb_agg(allkeys) AS "dataArray" FROM (SELECT json_build_array(${constants_1._NEWLINE}	${e.map(s=>(0,helpers_1.addDoubleQuotes)(s)).join(`,${constants_1._NEWLINE}	`)}) AS allkeys 
	FROM (${s.toString()}) AS p) AS l`,singular:!1,strip:!1,count:!1})};exports.asDataArray=asDataArray;