"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.listaddCssFiles=exports.addCssFile=void 0;const fs_1=__importDefault(require("fs")),path_1=__importDefault(require("path")),addCssFile=e=>fs_1.default.existsSync(__dirname+"/"+e)?fs_1.default.readFileSync(__dirname+"/"+e,"utf-8"):fs_1.default.readFileSync(__dirname+("/"+e.replace(".css",".min.css")),"utf-8"),listaddCssFiles=(exports.addCssFile=addCssFile,()=>{const s=[];return fs_1.default.readdirSync(path_1.default.join(__dirname)).filter(e=>e.endsWith(".css")).forEach(e=>{s.push(e)}),s});exports.listaddCssFiles=listaddCssFiles;