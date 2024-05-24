"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.formatColumnValue=void 0;const constants_1=require("../../constants"),helpers_1=require("../../helpers"),logger_1=require("../../logger");function formatColumnValue(e,t,r){if("object"==typeof t)return t.hasOwnProperty("@iot.name")?`(SELECT "id" FROM "${e.split("_")[0]}" WHERE "name" = '${(0,constants_1.ESCAPE_SIMPLE_QUOTE)(t["@iot.name"])}')`:t.hasOwnProperty("@iot.id")?t["@iot.id"]:"text[]"===r?(0,helpers_1.addSimpleQuotes)(`{${t.map(e=>(0,helpers_1.addDoubleQuotes)((0,helpers_1.removeSimpleQuotes)(e))).join(",")}}`):`'${(0,constants_1.ESCAPE_SIMPLE_QUOTE)(JSON.stringify(t))}'`;if(t)switch(t){case void 0:return"";case null:return"null";case t.isRawInstance:return t.toQuery();default:switch(r){case"number":return t;case"bool":return`'${(t="false"===t?0:t)?1:0}'`;case"json":case"jsonb":return(0,helpers_1.addSimpleQuotes)((0,constants_1.ESCAPE_SIMPLE_QUOTE)(JSON.stringify(t)));case"text[]":var s=(0,constants_1.ESCAPE_ARRAY_JSON)(String(t));return s?(0,helpers_1.addSimpleQuotes)(s):"ARRAY ERROR";case"result":return(0,helpers_1.addSimpleQuotes)((0,constants_1.ESCAPE_SIMPLE_QUOTE)(JSON.stringify(t)))}if(String(t).startsWith("(SELECT"))return""+t;try{return t.includes("'")?(0,helpers_1.addSimpleQuotes)((0,constants_1.ESCAPE_SIMPLE_QUOTE)(t)):(0,helpers_1.addSimpleQuotes)(t)}catch(e){return(0,helpers_1.addSimpleQuotes)(t)}}}exports.formatColumnValue=formatColumnValue;