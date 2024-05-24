"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.upload=void 0;const busboy_1=__importDefault(require("busboy")),path_1=__importDefault(require("path")),util_1=__importDefault(require("util")),fs_1=__importDefault(require("fs")),log_1=require("../log"),upload=r=>{const i={};return new Promise(async(e,s)=>{const a="./upload",u=["csv","txt","json"];fs_1.default.existsSync(a)||await util_1.default.promisify(fs_1.default.mkdir)(a).catch(e=>{i.state="ERROR",s(e)});var t=new busboy_1.default({headers:r.req.headers});t.on("file",(e,t,r)=>{var o=path_1.default.extname(r).substring(1);u.includes(o)?(t.pipe(fs_1.default.createWriteStream(a+"/"+r)),i.file=a+"/"+r,t.on("data",e=>{i.state=`GET ${e.length} bytes`}),t.on("error",e=>{log_1.log.errorMsg(e)}),t.on("end",()=>{i.state="UPLOAD FINISHED",i[e]=a+"/"+r})):(i.state="UPLOAD UNALLOWED FILE",t.resume(),s(i))}),t.on("field",(e,t)=>{i[e]=t}),t.on("error",e=>{log_1.log.errorMsg(e),i.state="ERROR",s(e)}),t.on("finish",()=>{i.state="DONE",e(i)}),r.req.pipe(t)})};exports.upload=upload;