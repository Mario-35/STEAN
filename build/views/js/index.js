"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.listaddJsFiles=exports.addJsFile=void 0;const fs_1=__importDefault(require("fs")),path_1=__importDefault(require("path")),addJsFile=e=>fs_1.default.existsSync(__dirname+"/"+e)?fs_1.default.readFileSync(__dirname+"/"+e,"utf-8"):fs_1.default.readFileSync(__dirname+("/"+e.replace(".js",".min.js")),"utf-8"),listaddJsFiles=(exports.addJsFile=addJsFile,()=>{const s=[];return fs_1.default.readdirSync(path_1.default.join(__dirname)).filter(e=>e.endsWith(".js")).forEach(e=>{s.push(e)}),s});exports.listaddJsFiles=listaddJsFiles;