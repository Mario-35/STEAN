"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Core=void 0;const helpers_1=require("../../../helpers");class Core{_src;constructor(r){this._src=r?"string"==typeof r?[r]:r:[]}addKey(r){("string"==typeof r?[r]:r).forEach(r=>{r=(r=r.includes(" AS ")?r.split(" AS ")[1]:r).includes(".")?r.split(".")[1]:r,this._src.includes(r)||""===r.trim()||this._src.push((0,helpers_1.removeAllQuotes)(r))})}add(r){this._src.push(r)}init(r){this._src=[r]}toArray(){return this._src}toString(){return this._src.join("")}notNull(){return 0<this._src.filter(r=>r+"").length}replace(s,e){this._src=this._src.map(r=>"string"==typeof r?r.replace(s,e):r)}}exports.Core=Core;