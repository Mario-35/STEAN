"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.getBigIntFromString=void 0;const log_1=require("../log"),getBigIntFromString=t=>{if(t)try{var r;return"string"==typeof t?(r=t.match(/\([^\d]*(\d+)[^\d]*\)/))?BigInt(r[1]):BigInt(t.match(/[0-9]/g)?.join("")):BigInt(t)}catch(t){log_1.log.errorMsg(t)}};exports.getBigIntFromString=getBigIntFromString;