"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.createOdata=void 0;const parser_1=require("./parser/parser"),helpers_1=require("../helpers"),configuration_1=require("../configuration"),queries_1=require("../db/queries"),visitor_1=require("./visitor"),doSomeWarkAfterCreateAst=async(e,r)=>{(e.returnFormat===helpers_1.returnFormats.csv&&"Observations"===e.entity&&e.parentEntity?.endsWith("atastreams")&&e.parentId&&0<e.parentId||e.splitResult&&"ALL"==e.splitResult[0].toUpperCase()&&e.parentId&&0<e.parentId)&&(r=await configuration_1.serverConfig.connection(r.config.name).unsafe(""+(0,queries_1.multiDatastreamKeys)(e.parentId)),e.splitResult=r[0].keys)},escapesOdata=e=>{const t={"/":"%252F","\\":"%255C"};if(e.includes("%27")){const s=[];return e.split("%27").forEach((r,e)=>{1===e&&Object.keys(t).forEach(e=>r=r.split(e).join(t[e])),s.push(r)}),s.join("%27")}return e},createOdata=async e=>{const r={onlyValue:!1,onlyRef:!1,valueskeys:!1};let t=""+e.decodedUrl.path+e.decodedUrl.search;t&&""!=t.trim()&&(t=escapesOdata(t));const s=(e,r)=>t=t.split(e).join(r||""),a=e=>{s("&"+e),s(e)};var i,o;if(s("geography%27","%27"),"/"!==(t=(0,helpers_1.cleanUrl)(s("@iot.id","id"))))return t.includes("$")&&t.split("$").forEach(e=>{switch(e){case"value?":case"value":r.onlyValue=!0,a("/$"+e);break;case"ref":r.onlyRef=!0,a("/$"+e);break;case"valuesKeys=true":r.valueskeys=!0,a("$"+e)}}),(i=(0,helpers_1.cleanUrl)(t).split("?"))[1]||i.push("$top="+(e.config.nb_page||200)),i[0].split("(").length!=i[0].split(")").length&&(i[0]+=")"),o=(0,parser_1.resourcePath)(i[0]),i=(0,parser_1.query)(decodeURIComponent(i[1])),o=new visitor_1.RootPgVisitor(e,r,o).start(i),await doSomeWarkAfterCreateAst(o,e),o};exports.createOdata=createOdata;