"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.writeToLog=void 0;const _1=require("."),helpers_1=require("../helpers"),helpers_2=require("../db/helpers"),models_1=require("../models"),log_1=require("../log"),helpers_3=require("../models/helpers"),writeToLog=async(e,...o)=>{if(0<o.length&&_1.formatLog.writeErrorInFile(e,o),e.log&&"GET"!=e.log.method){e.log.code=o&&o.code?+o.code:+e.response.status,e.log.error=o,e.log.datas=(0,helpers_1.hidePassword)(e.log.datas);try{e.body&&e.body&&"string"==typeof e.body&&(e.log.returnid=JSON.parse(e.body)["@iot.id"])}catch(o){e.log.returnid=void 0}var r=Math.floor(e.log.code/100);2!=r&&3!=r&&await(0,helpers_2.executeSqlValues)(e.config,`INSERT INTO ${(0,helpers_1.addDoubleQuotes)(models_1.models.DBFull(e.config).Logs.table)} ${(0,helpers_3.createInsertValues)(e.config,e.log,models_1.models.DBFull(e.config).Logs.name)} returning id`).then(e=>{(0,helpers_1.isTest)()}).catch(e=>{log_1.log.errorMsg(e)})}};exports.writeToLog=writeToLog;