"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.decodeloraDeveuiPayload=void 0;const _1=require("."),helpers_1=require("../db/helpers"),logger_1=require("../logger"),messages_1=require("../messages"),decodeloraDeveuiPayload=async(e,r,o)=>(0,helpers_1.executeSql)(e.config,`SELECT "name", "code", "nomenclature", "synonym" FROM "${e.model.Decoders.table}" WHERE id = (SELECT "decoder_id" FROM "${e.model.Loras.table}" WHERE "deveui" = '${r}') LIMIT 1`).then(e=>{try{return(0,_1.decodingPayload)({...e[0]},o)}catch(e){}}).catch(()=>({decoder:"undefined",result:void 0,error:messages_1.errors.DecodingPayloadError}));exports.decodeloraDeveuiPayload=decodeloraDeveuiPayload;