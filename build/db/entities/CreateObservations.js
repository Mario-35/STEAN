"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.CreateObservations=void 0;const common_1=require("./common"),logger_1=require("../../logger"),helpers_1=require("../helpers"),helpers_2=require("../../helpers"),messages_1=require("../../messages/"),enums_1=require("../../enums"),util_1=__importDefault(require("util")),constants_1=require("../../constants"),models_1=require("../../models"),log_1=require("../../log");class CreateObservations extends common_1.Common{indexResult=-1;constructor(e){super(e)}createListColumnsValues(s,e){const o=[],r="COLUMNS"===s?'"':"'";return e.forEach((e,t)=>{switch(e){case"result":this.indexResult=t+1;break;case"FeatureOfInterest/id":e="featureofinterest_id"}o.push(isNaN(+e)?Array.isArray(e)?`'{"value": [${e}]}'`:"string"==typeof e?e.endsWith("Z")?`TO_TIMESTAMP('${(0,helpers_1.dateToDateWithTimeZone)(e)}', '${enums_1.EnumDatesType.dateWithOutTimeZone}')::TIMESTAMP`:r+e+r:r+`{${e}}`+r:t!==this.indexResult||"VALUES"!==s||this.ctx.config.extensions.includes(enums_1.EnumExtensions.numeric)?e:`'{"value": ${e}}'`)}),o}async getAll(){this.ctx.throw(400,{code:400})}async getSingle(e){this.ctx.throw(400,{code:400})}async postForm(e){(0,constants_1.setDebug)(!0);const s=JSON.parse(this.ctx.datas.datas||this.ctx.datas.json),o=(s.columns||this.ctx.throw(404,{code:404,detail:messages_1.errors.noColumn}),[]),r=[];await(0,helpers_2.asyncForEach)(Object.keys(s.columns),async e=>{var t=await models_1.models.getStreamInfos(this.ctx.config,s.columns[e]);t?(r.push(t),o.push({column:e,stream:t})):this.ctx.throw(404,(0,messages_1.msg)(messages_1.errors.noValidStream,util_1.default.inspect(s.columns[e],{showHidden:!1,depth:null,colors:!1})))});var t,a={tempTable:"temp"+Date.now().toString(),filename:this.ctx.datas.file,columns:o,header:s.header&&1==s.header?", HEADER":"",stream:r},i=await(0,helpers_1.queryInsertFromCsv)(this.ctx,a);if(i)return t=i.query.map((e,t)=>(0===t?"WITH ":", ")+`updated${t+1} as (${e})
`),await(0,helpers_1.executeSql)(this.ctx.config,"SET session_replication_role = replica;"),t=await(0,helpers_1.executeSql)(this.ctx.config,`${t.join("")}SELECT (SELECT count(*) FROM ${a.tempTable}) AS total, (SELECT count(*) FROM updated1) AS inserted`),await(0,helpers_1.executeSql)(this.ctx.config,"SET session_replication_role = DEFAULT;"),this.formatReturnResult({total:i.count,body:[`Add ${t[0].inserted} on ${t[0].total} lines from `+a.filename.split("/").reverse()[0]]})}async postJson(r){const a=[];let i=0;const e=await models_1.models.getStreamInfos(this.ctx.config,r);if(e){if(await(0,helpers_2.asyncForEach)(r.dataArray,async t=>{const s=[`"${e.type?.toLowerCase()}_id"`].concat(this.createListColumnsValues("COLUMNS",r.components)),o=this.createListColumnsValues("VALUES",[String(e.id),...t]);await(0,helpers_1.executeSqlValues)(this.ctx.config,`INSERT INTO ${(0,helpers_2.addDoubleQuotes)(this.ctx.model.Observations.table)} (${s}) VALUES (${o}) RETURNING id`).then(e=>{a.push(this.linkBase.replace("Create","")+"("+e[0]+")"),i+=1}).catch(async e=>{"23505"===e.code?(a.push(`Duplicate (${t})`),r.duplicate&&"DELETE"===r.duplicate.toUpperCase()&&await(0,helpers_1.executeSqlValues)(this.ctx.config,`DELETE FROM ${(0,helpers_2.addDoubleQuotes)(this.ctx.model.Observations.table)} WHERE 1=1 `+s.map((e,t)=>`AND ${e} = `+o[t]).join(" ")+" RETURNING id").then(e=>{a.push("delete id ==> "+e[0]),i+=1}).catch(e=>{log_1.log.errorMsg(e),logger_1.formatLog.writeErrorInFile(void 0,e)})):this.ctx.throw(400,{code:400,detail:e})})}),a)return this.formatReturnResult({total:i,body:a})}else this.ctx.throw(404,{code:404,detail:messages_1.errors.noStream})}async post(e){return this.ctx.datas?await this.postForm(e):await this.postJson(e)}async update(e,t){this.ctx.throw(400,{code:400})}async delete(e){this.ctx.throw(400,{code:400})}}exports.CreateObservations=CreateObservations;