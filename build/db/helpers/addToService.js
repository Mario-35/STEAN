"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.addToService=void 0;const helpers_1=require("../../helpers"),logger_1=require("../../logger"),models_1=require("../../models"),helpers_2=require("../../models/helpers"),helper_1=require("../../odata/visitor/helper"),dataAccess_1=require("../dataAccess"),executeSqlValues_1=require("./executeSqlValues"),addToService=async(s,e)=>{var a=(0,helper_1.blankRootPgVisitor)(s,s.model.Loras);if(a){s.odata=a;const o=new dataAccess_1.apiAccess(s);await(0,helpers_1.asyncForEach)(e.value,async a=>{if("000000000000000000"!=a.payload)try{var r=a.value?{timestamp:a.phenomenonTime,value:a.value,deveui:a.deveui.toUpperCase()}:{timestamp:a.phenomenonTime,frame:a.payload.toUpperCase(),deveui:a.deveui.toUpperCase()};await o.post(r)}catch(e){r={method:"PAYLOADS",code:e.code?+e.code:+s.response.status,url:"/Loras",database:s.config.pg.database,datas:a,user_id:String(s.user.id),error:e};await(0,executeSqlValues_1.executeSqlValues)(s.config,`INSERT INTO ${(0,helpers_1.addDoubleQuotes)(models_1.models.DBFull(s.config).Logs.table)} ${(0,helpers_2.createInsertValues)(s.config,r,models_1.models.DBFull(s.config).Logs.name)} returning id`)}})}return{}};exports.addToService=addToService;