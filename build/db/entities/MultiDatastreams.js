"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.MultiDatastreams=void 0;const common_1=require("./common"),messages_1=require("../../messages/"),logger_1=require("../../logger");class MultiDatastreams extends common_1.Common{constructor(e){super(e)}formatDataInput(e){e||this.ctx.throw(400,{code:400,detail:messages_1.errors.noData});var t=this.getKeysValue(e,["FeaturesOfInterest","foi"]);return t&&(e._default_foi=t),e.multiObservationDataTypes&&e.unitOfMeasurements&&e.ObservedProperties&&(e.multiObservationDataTypes.length!=e.unitOfMeasurements.length&&this.ctx.throw(400,{code:400,detail:(0,messages_1.msg)(messages_1.errors.sizeListKeysUnitOfMeasurements,e.unitOfMeasurements.length,e.multiObservationDataTypes.length)}),e.multiObservationDataTypes.length!=e.ObservedProperties.length)&&this.ctx.throw(400,{code:400,detail:(0,messages_1.msg)(messages_1.errors.sizeListKeysObservedProperties,e.ObservedProperties.length,e.multiObservationDataTypes.length)}),e&&e.multiObservationDataTypes&&null!=e.multiObservationDataTypes&&(e.multiObservationDataTypes=JSON.stringify(e.multiObservationDataTypes).replace("[","{").replace("]","}")),e.observationType?this.ctx.model.MultiDatastreams.columns.observationType.verify?.list.includes(e.observationType)||this.ctx.throw(400,{code:400,detail:messages_1.errors.observationType}):e.observationType=this.ctx.model.MultiDatastreams.columns.observationType.verify?.default,e}}exports.MultiDatastreams=MultiDatastreams;