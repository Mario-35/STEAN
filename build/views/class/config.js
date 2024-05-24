"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Config=void 0;const enums_1=require("../../enums"),core_1=require("./core");class Config extends core_1.CoreHtmlView{constructor(e,t){super(e),this.first(t)}first(t){t.url="/create";var e=e=>t.why&&t.why[e]?`<div class="alert">${t.why[e]}</div>`:"";this._HTMLResult=[`
          <!DOCTYPE html>
            <html>
              ${this.head("Login","user")}    
            <body>
            <div class="login-wrap">
            <div class="login-html">
            ${this.title(this.ctx.config.name)}
                    <input  id="tab-1" 
                            type="radio" 
                            name="tab" 
                            class="sign-in" checked>
                    <label for="tab-1" class="tab">Service</label>
                    <input  id="tab-2" 
                            type="radio" 
                            name="tab" 
                            class="sign-up">
                    <label for="tab-2" class="tab">Options</label>
                    <div class="login-form">
                      <form action="${t.url}" method="post">
                        <div class="sign-in-htm">
                        ${this.addTextInput({id:"regapiversion",name:"apiversion",label:"Version",value:t.body&&t.body.apiversion||this.ctx.config.apiVersion,alert:e("apiversion"),toolType:Object.values(enums_1.EnumVersion).join()})}
                        ${this.addTextInput({id:"regdate_format",name:"date_format",label:"Date format",value:t.body&&t.body.date_format||this.ctx.config.date_format,alert:e("date_format"),toolType:"Host must be at least 2 words"})}
                        ${this.addTextInput({id:"regwebSite",name:"webSite",label:"Web Site",value:t.body&&t.body.regwebSite||this.ctx.config.webSite,alert:e("webSite"),toolType:"Name must be at least 2 words"})}
                        ${this.addTextInput({id:"regnb_page",name:"nb_page",label:"nb page",value:t.body&&t.body.nb_page||this.ctx.config.nb_page,alert:e("nb_page"),toolType:"Name must be at least 2 words"})}
                        ${this.addTextInput({id:"logFile",name:"logFile",label:"log File",value:t.body&&t.body.logFile||this.ctx.config.logFile,alert:e("logFile"),toolType:"Name must be at least 2 words"})}
                        </div>
                        <div class="sign-up-htm">
                        ${this.addCheckBox({id:"forceHttps",checked:t.body&&!0===t.body.forceHttps||this.ctx.config.forceHttps,label:" force Https"})}
                        ${this.addCheckBox({id:"stripNull",checked:t.body&&!0===t.body.stripNull||this.ctx.config.stripNull,label:" strip Null"})}
                        ${this.addCheckBox({id:"highPrecision",checked:t.body&&!0===t.body.highPrecision||this.ctx.config.highPrecision,label:" high Precision"})}
                        ${this.addCheckBox({id:"canDrop",checked:t.body&&!0===t.body.canDrop||this.ctx.config.canDrop,label:" can Drop"})}
                        </div>
                      </form>
                  </div>
                </div>
              </div>
            </body>                  
          </html>`]}}exports.Config=Config;