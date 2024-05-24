"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.First=void 0;const core_1=require("./core");class First extends core_1.CoreHtmlView{constructor(e,s){super(e),this.first(s)}first(s){s.url="/create";var e=e=>s.why&&s.why[e]?`<div class="alert">${s.why[e]}</div>`:"";this._HTMLResult=[`
          <!DOCTYPE html>
            <html>
              ${this.head("Login","user")}    
            <body>
            <div class="login-wrap">
            <div class="login-html">
            ${this.title("First Install")}
                    <input  id="tab-1" 
                            type="radio" 
                            name="tab" 
                            class="sign-in" checked>
                    <label for="tab-1" class="tab">Service</label>
                    <input  id="tab-2" 
                            type="radio" 
                            name="tab" 
                            class="sign-up">
                    <label for="tab-2" class="tab">Admin</label>
                    <div class="login-form">
                      <form action="${s.url}" method="post">
                        <div class="sign-in-htm">
                        ${this.addTextInput({id:"regservice",name:"service",label:"Service name",value:s.body&&s.body.regservice||"",alert:e("service"),toolType:"Name must be at least 5 chars"})}
                        ${this.addTextInput({id:"regservicehost",name:"servicehost",label:"Host name",value:s.body&&s.body.regservicehost||"localhost",alert:e("host"),toolType:"Host must be at least 5 chars"})}
                        ${this.addTextInput({id:"regserviceusername",name:"serviceusername",label:"Username",value:s.body&&s.body.regserviceusername||"",alert:e("username"),toolType:"Name must be at least 5 chars"})}
                        ${this.addTextInput({id:"servicepassword",name:"servicepassword",label:"Password",password:!0,value:s.body&&s.body.service||"",alert:e("password"),toolType:"At least one number, one lowercase and one uppercase letter, at least six characters that are letters, numbers or the underscore"})}
                        ${this.addTextInput({id:"regservicerepeat",name:"servicerepeat",label:"Repeat password",password:!0,value:"",alert:e("repeat"),toolType:"Same as password"})}
                        </div>
                        <div class="sign-up-htm">
                        ${this.addTextInput({id:"reghost",name:"host",label:"Host name",value:s.body&&s.body.host||"localhost",alert:e("host"),toolType:"Host must be at least 5 chars"})}
                        ${this.addTextInput({id:"regusername",name:"username",label:"Username",value:s.body&&s.body.username||"",alert:e("username"),toolType:"Name must be at least 5 chars"})}
                        ${this.addTextInput({id:"regpass",name:"password",label:"Password",password:!0,value:s.body&&s.body.password||"",alert:e("password"),toolType:"At least one number, one lowercase and one uppercase letter, at least six characters that are letters, numbers or the underscore"})}
                        ${this.addTextInput({id:"regrepeat",name:"repeat",label:"Repeat password",password:!0,value:"",alert:e("repeat"),toolType:"Same as password"})}
                        ${this.addSubmitButton("Create configuration")}
                        </div>
                      </form>
                  </div>
                </div>
              </div>
            </body>                  
          </html>`]}}exports.First=First;