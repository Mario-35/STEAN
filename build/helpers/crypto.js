"use strict";var __importDefault=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.decrypt=exports.encrypt=void 0;const crypto_1=__importDefault(require("crypto")),constants_1=require("../constants"),log_1=require("../log"),encrypt=t=>{var r=crypto_1.default.randomBytes(16),e=crypto_1.default.createCipheriv("aes-256-ctr",constants_1.APP_KEY,r),t=Buffer.concat([e.update(t),e.final()]);return r.toString("hex")+"."+t.toString("hex")},decrypt=(exports.encrypt=encrypt,t=>{if("string"==typeof(t=t.split("\r\n").join(""))&&"."==t[32])try{var r=crypto_1.default.createDecipheriv("aes-256-ctr",constants_1.APP_KEY,Buffer.from(t.substring(32,0),"hex"));return Buffer.concat([r.update(Buffer.from(t.slice(33),"hex")),r.final()]).toString()}catch(t){log_1.log.errorMsg(t)}return t});exports.decrypt=decrypt;