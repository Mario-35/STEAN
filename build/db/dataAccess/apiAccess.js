"use strict";var __createBinding=this&&this.__createBinding||(Object.create?function(t,e,i,n){void 0===n&&(n=i);var r=Object.getOwnPropertyDescriptor(e,i);r&&("get"in r?e.__esModule:!r.writable&&!r.configurable)||(r={enumerable:!0,get:function(){return e[i]}}),Object.defineProperty(t,n,r)}:function(t,e,i,n){t[n=void 0===n?i:n]=e[i]}),__setModuleDefault=this&&this.__setModuleDefault||(Object.create?function(t,e){Object.defineProperty(t,"default",{enumerable:!0,value:e})}:function(t,e){t.default=e}),__importStar=this&&this.__importStar||function(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var i in t)"default"!==i&&Object.prototype.hasOwnProperty.call(t,i)&&__createBinding(e,t,i);return __setModuleDefault(e,t),e};Object.defineProperty(exports,"__esModule",{value:!0}),exports.apiAccess=void 0;const entities=__importStar(require("../entities/index")),logger_1=require("../../logger"),helpers_1=require("../../helpers"),models_1=require("../../models");class apiAccess{myEntity;ctx;constructor(t,e){this.ctx=t;e=models_1.models.getEntityName(this.ctx.config,e||this.ctx.odata.entity);e&&e in entities&&(this.myEntity=new entities[this.ctx,e](t))}formatDataInput(t){return this.myEntity?this.myEntity.formatDataInput(t):t}async getAll(){if(this.myEntity)return this.myEntity.getAll()}async getSingle(t){if(this.myEntity)return this.myEntity.getSingle(t)}async post(t){if(this.myEntity)return(0,helpers_1.isArray)(this.ctx.body)?await this.myEntity.addWultipleLines(t||this.ctx.body):await this.myEntity.post(t||this.ctx.body)}async update(t){if(this.myEntity)return this.myEntity.update(t,this.ctx.body)}async delete(t){if(this.myEntity)return this.myEntity.delete(t)}}exports.apiAccess=apiAccess;