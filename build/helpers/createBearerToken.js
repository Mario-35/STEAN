"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.createBearerToken=void 0;const cookie_parser_1=__importDefault(require("cookie-parser")),constants_1=require("../constants"),messages_1=require("../messages"),cookie_1=__importDefault(require("cookie")),getCookie=(e,r)=>cookie_1.default.parse(e)[r]??!1,createBearerToken=e=>{var r="access_token",o="access_token";if(!constants_1.APP_KEY)throw new Error(messages_1.errors.tokenMissing);var{body:t,header:s,query:a}=e.request;let i=0,n;a&&a[r]&&(n=a[r],i+=1),t&&t[o]&&(n=t[o],i+=1),s&&(s.authorization&&2===(a=s.authorization.split(" ")).length&&"Bearer"===a[0]&&([,n]=a,i+=1),s.cookie)&&(r=getCookie(s.cookie,"jwt-session"))&&(t=cookie_parser_1.default.signedCookie(r,constants_1.APP_KEY))&&(n=t,i+=1),1<i&&e.throw(400,"token_invalid",{message:messages_1.errors.tokenInvalid}),e.request.token=n};exports.createBearerToken=createBearerToken;