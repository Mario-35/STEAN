"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Decoders=void 0;const common_1=require("./common"),logger_1=require("../../logger"),helpers_1=require("../../helpers"),lora_1=require("../../lora"),helpers_2=require("../helpers");class Decoders extends common_1.Common{constructor(e){super(e)}async getAll(){if(this.ctx.odata.payload){const t={};var e=await(0,helpers_2.executeSql)(this.ctx.config,'SELECT "id", "name", "code", "nomenclature", "synonym" FROM '+(0,helpers_1.addDoubleQuotes)(this.ctx.model.Decoders.table));return await(0,helpers_1.asyncForEach)(Object(e),async e=>{var o;this.ctx.odata.payload&&(o=(0,lora_1.decodingPayload)({name:e.name,code:String(e.code),nomenclature:e.nomenclature},this.ctx.odata.payload),t[e.id]=o)}),this.formatReturnResult({body:t})}return super.getAll()}async getSingle(e){var o;return this.ctx.odata.payload?(o=await(0,helpers_2.executeSqlValues)(this.ctx.config,`SELECT "id", "name", "code", "nomenclature", "synonym" FROM "${this.ctx.model.Decoders.table}" WHERE id = `+this.ctx.odata.id))[0]?this.formatReturnResult({body:(0,lora_1.decodingPayload)({name:o[0].name,code:String(o[0].code),nomenclature:o[0].nomenclature},this.ctx.odata.payload)}):void 0:super.getSingle(e)}}exports.Decoders=Decoders;