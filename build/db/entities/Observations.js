"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Observations=void 0;const common_1=require("./common"),helpers_1=require("../helpers"),logger_1=require("../../logger"),helpers_2=require("../../helpers"),messages_1=require("../../messages"),queries_1=require("../queries"),enums_1=require("../../enums");class Observations extends common_1.Common{constructor(e){super(e)}async prepareInputResult(e){var t;return e.MultiDatastream&&null!=e.MultiDatastream||this.ctx.odata.parentEntity&&this.ctx.odata.parentEntity.startsWith("MultiDatastream")?((t=e.MultiDatastream&&null!=e.MultiDatastream?BigInt(e.MultiDatastream["@iot.id"]):(0,helpers_2.getBigIntFromString)(this.ctx.odata.parentId))||this.ctx.throw(404,{code:404,detail:(0,messages_1.msg)(messages_1.errors.noFound,"MultiDatastreams")}),t=(await(0,helpers_1.executeSqlValues)(this.ctx.config,(0,queries_1.multiDatastreamsUnitsKeys)(t)))[0],e.result&&"object"==typeof e.result&&(Object.keys(e.result).length!=t.length&&this.ctx.throw(400,{code:400,detail:(0,messages_1.msg)(messages_1.errors.sizeResultUnitOfMeasurements,String(Object.keys(e.result).length),t.length)}),e.result={value:Object.values(e.result),valueskeys:e.result})):e.Datastream&&null!=e.Datastream||this.ctx.odata.parentEntity&&this.ctx.odata.parentEntity.startsWith("Datastream")?e.result&&"object"!=typeof e.result&&(e.result=this.ctx.config.extensions.includes(enums_1.EnumExtensions.numeric)?e.result:{value:e.result}):"POST"===this.ctx.request.method&&this.ctx.throw(404,{code:404,detail:messages_1.errors.noStream}),e}formatDataInput(e){return e&&!e.resultTime&&e.phenomenonTime&&(e.resultTime=e.phenomenonTime),e}async post(e){if(!(e=e&&await this.prepareInputResult(e)).import)return super.post(e)}async update(e,t){return(t=t&&await this.prepareInputResult(t))&&(t.validTime=await(0,helpers_1.getDBDateNow)(this.ctx.config)),super.update(e,t)}}exports.Observations=Observations;