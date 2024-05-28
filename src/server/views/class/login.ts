/**
 * HTML Views Login for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- HTML Views Login for API. -----------------------------------!");
import { IKeyString, koaContext } from "../../types";
import { CoreHtmlView } from "./core";

interface Idatas { 
  login: boolean; 
  body?: any; 
  why?: IKeyString
}


export class Login extends CoreHtmlView {
    constructor(ctx: koaContext, datas: Idatas) {
        super(ctx);
        this.login(datas);
    }

    private login(datas: Idatas) {
        const alert = (name: string): string => {
            return datas.why && datas.why[name] ? `<div class="alert">${datas.why[name]}</div>` : "";
        };
      const url = `${this.ctx.decodedUrl.linkbase}/${this.ctx.config.apiVersion}`;  
        this._HTMLResult = [`
          <!DOCTYPE html>
            <html>
              ${this.head("Login", "user")}    
            <body>
                <div class="login-wrap">
                  <div class="login-html">
                    ${this.title("Identification")}
                    <input  id="tab-1" 
                            type="radio" 
                            name="tab" 
                            class="sign-in"
                            ${datas.login ? " checked" : ""}>
                    <label for="tab-1" class="tab">Sign In</label>
                    <input  id="tab-2" 
                            type="radio" 
                            name="tab" 
                            class="sign-up"
                            ${ datas.login ? "" : "checked" }>
                    <label for="tab-2" class="tab">Sign Up</label>
                    <div class="login-form">
                      <form action="${url}/login" method="post">
                        <div class="sign-in-htm">
                          ${this.addTextInput({name: "username", label: "Username", value: ""})}
                          ${this.addTextInput({name: "password", label: "Password", value: "", password: true})}
                          ${this.addCheckBox({name: "check", checked: true, label: " Keep me Signed in"})}
                          ${this.addSubmitButton("Sign In")}
                          ${this.hr()}
                          ${this.addButton(`${url}/Query`, "Return to Query")}
                          <div class="foot-lnk">
                            <a href="#forgot">Forgot Password?</a>
                          </div>
                        </div>
                      </form>
            
                      <form action="${url}/register" method="post">
                        <div class="sign-up-htm">
                          ${this.addTextInput({name: "username", label: "Username", value: datas.body && datas.body.username ? datas.body.username : "", alert: alert("username"), toolType: "Name must be at least 2 words"})}
                          ${this.addTextInput({name: "pass", label: "Password", password: true, value: datas.body && datas.body.password ? datas.body.password : "", alert: alert("password"), toolType: "At least one number, one lowercase and one uppercase letter, at least six characters that are letters, numbers or the underscore"})}
                          ${this.addTextInput({name: "repeat", label: "Repeat password", password: true, value: "", alert: alert("repeat"), toolType: "Same as password"})}
                          ${this.addTextInput({name: "mail", label: "Email address", value: datas.body && datas.body.email ? datas.body.email : "", alert: alert("email"), toolType: "A valid email address"})}
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
          </html>`];
    };
  }
