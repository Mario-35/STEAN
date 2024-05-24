"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.CoreHtmlView=void 0;const css_1=require("../css");class CoreHtmlView{ctx;_HTMLResult;constructor(s,e){this.ctx=s,this._HTMLResult=e?"string"==typeof e?[e]:e:[]}css(s){return"user"===s.toLowerCase()?(0,css_1.addCssFile)("userForm.css"):(0,css_1.addCssFile)("query.css")}title(s){return`<div class="title">${s}</div>`}hr(){return'<div class="hr"></div>'}head(s,e){return`<head>
                <meta charset="utf-8">
                <style>${this.css(e)}</style>
                <title>${s}</title>
              </head>`}foot(s){const e=[this.hr()];return s.forEach(s=>{e.push(`
            <div class="inner">
              <a  href="${s.href}" 
                  class="${s.class}">${s.name}</a>
            </div>`)}),e.join()}addSubmitButton(s){return`<div class="group">
                <input type="submit" class="button" value="${s}">
              </div>`}addButton(s,e){return`<div class="group">
                <a href="${s}" class="button" >${e}</a>
              </div>`}addCheckBox(s){return`<div class="group"> 
                <input  id="${s.id}" 
                        type="checkbox" 
                        class="check"${!0===s.checked?" checked":""}> 
                <label for="${s.id}"><span class="icon"></span>${s.label||s.id}</label>
              </div>`}addTextInput(s){return`<div class="group">
                <label  for="${s.id}" 
                        class="label">${s.label}
                </label>
                ${s.toolType?`<div class='tooltip help'>
                                        <span>?</span>
                                        <div class='content'>
                                          <b></b>
                                          <p>${s.toolType}</p>
                                        </div>
                                      </div>`:""}
                <input  id="${s.id}" 
                        name="${s.name||s.id}" 
                        type="${s.password&&1==s.password?"password":"text"}" 
                        class="input" 
                        value="${s.value}">
                ${s.alert||""}
              </div>`}toArray(){return this._HTMLResult}toString(){return this._HTMLResult.filter(s=>""!==s).join("")}}exports.CoreHtmlView=CoreHtmlView;