"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0});const fs_1=__importDefault(require("fs")),crypto_1=__importDefault(require("crypto")),tests_1=require("../helpers/tests"),decrypt=(e,t)=>{if(e=e.split("\r\n").join(""),(0,tests_1.isString)("string")&&"."==e[32])try{var r=crypto_1.default.createDecipheriv("aes-256-ctr",t,Buffer.from(e.substring(32,0),"hex"));return Buffer.concat([r.update(Buffer.from(e.slice(33),"hex")),r.final()]).toString()}catch(e){}return e};function decode(e){var t=fs_1.default.readFileSync(__dirname+"/.key","utf8")||"zLwX893Mtt9Rc0TKvlInDXuZTFj9rxDV",e=fs_1.default.readFileSync(e,"utf8");return decrypt(e,t)}process.stdout.write(decode(__dirname+"/production.json")+"\n");