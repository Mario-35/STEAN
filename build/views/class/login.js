"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Login=void 0;const core_1=require("./core");class Login extends core_1.CoreHtmlView{constructor(e,a){super(e),this.login(a)}login(a){var e=e=>a.why&&a.why[e]?`<div class="alert">${a.why[e]}</div>`:"",s=this.ctx.decodedUrl.linkbase+"/"+this.ctx.config.apiVersion;this._HTMLResult=[`
          <!DOCTYPE html>
            <html>
              ${this.head("Login","user")}    
            <body>
                <div class="login-wrap">
                  <div class="login-html">
                    ${this.title("Identification")}
                    <input  id="tab-1" 
                            type="radio" 
                            name="tab" 
                            class="sign-in"
                            ${a.login?" checked":""}>
                    <label for="tab-1" class="tab">Sign In</label>
                    <input  id="tab-2" 
                            type="radio" 
                            name="tab" 
                            class="sign-up"
                            ${a.login?"":"checked"}>
                    <label for="tab-2" class="tab">Sign Up</label>
                    <div class="login-form">
                      <form action="${s}/login" method="post">
                        <div class="sign-in-htm">
                          ${this.addTextInput({id:"user",name:"username",label:"Username",value:""})}
                          ${this.addTextInput({id:"pass",name:"password",label:"Password",value:"",password:!0})}
                          ${this.addCheckBox({id:"check",checked:!0,label:" Keep me Signed in"})}
                          ${this.addSubmitButton("Sign In")}
                          ${this.hr()}
                          ${this.addButton(s+"/Query","Return to Query")}
                          <div class="foot-lnk">
                            <a href="#forgot">Forgot Password?</a>
                          </div>
                        </div>
                      </form>
            
                      <form action="${s}/register" method="post">
                        <div class="sign-up-htm">
                          ${this.addTextInput({id:"regusername",name:"username",label:"Username",value:a.body&&a.body.username?a.body.username:"",alert:e("username"),toolType:"Name must be at least 2 words"})}
                          ${this.addTextInput({id:"regpass",name:"password",label:"Password",password:!0,value:a.body&&a.body.password?a.body.password:"",alert:e("password"),toolType:"At least one number, one lowercase and one uppercase letter, at least six characters that are letters, numbers or the underscore"})}
                          ${this.addTextInput({id:"regrepeat",name:"repeat",label:"Repeat password",password:!0,value:"",alert:e("repeat"),toolType:"Same as password"})}
                          ${this.addTextInput({id:"regmail",name:"email",label:"Email address",value:a.body&&a.body.email?a.body.email:"",alert:e("email"),toolType:"A valid email address"})}
                          ${this.addSubmitButton("Sign UP")}
                          ${this.hr()}                                
                          <div class="foot-lnk">
                            <label for="tab-1">Already Member ?</a>
                          </div>
                        </div>
                      </form>
                  </div>
                </div>
              </div>
            </body>                  
          </html>`]}}exports.Login=Login;