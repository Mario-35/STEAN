/**
 * HTML Views First for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IKeyString, koaContext } from "../../types";
import { CoreHtmlView } from "./core";

interface Idatas { 
  login: boolean; 
  url: string; 
  body?: any; 
  why?: IKeyString
}


export class First extends CoreHtmlView {
    constructor(ctx: koaContext, datas: Idatas) {
        super(ctx);
        this.first(datas);
    }

    private first(datas: Idatas) {
      datas.url = '/create';
      
        const alert = (name: string): string => {
            return datas.why && datas.why[name] ? `<div class="alert">${datas.why[name]}</div>` : "";
        };
        this._HTMLResult = [`
          <!DOCTYPE html>
            <html>
              ${this.head("Login", "user")}    
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
                      <form action="${datas.url}" method="post">
                        <div class="sign-in-htm">
                        ${this.addTextInput({id: "regservice", name: "service", label: "Service name", value: datas.body && datas.body.regservice || "", alert: alert("service"), toolType: "Name must be at least 5 chars"})}
                        ${this.addTextInput({id: "regservicehost", name: "servicehost", label: "Host name", value: datas.body && datas.body.regservicehost || "localhost", alert: alert("host"), toolType: "Host must be at least 5 chars"})}
                        ${this.addTextInput({id: "regserviceusername", name: "serviceusername", label: "Username", value: datas.body && datas.body.regserviceusername || "", alert: alert("username"), toolType: "Name must be at least 5 chars"})}
                        ${this.addTextInput({id: "servicepassword", name: "servicepassword", label: "Password", password: true, value: datas.body && datas.body.service || "", alert: alert("password"), toolType: "At least one number, one lowercase and one uppercase letter, at least six characters that are letters, numbers or the underscore"})}
                        ${this.addTextInput({id: "regservicerepeat", name: "servicerepeat", label: "Repeat password", password: true, value: "", alert: alert("repeat"), toolType: "Same as password"})}
                        </div>
                        <div class="sign-up-htm">
                        ${this.addTextInput({id: "reghost", name: "host", label: "Host name", value: datas.body && datas.body.host || "localhost", alert: alert("host"), toolType: "Host must be at least 5 chars"})}
                        ${this.addTextInput({id: "regusername", name: "username", label: "Username", value: datas.body && datas.body.username || "", alert: alert("username"), toolType: "Name must be at least 5 chars"})}
                        ${this.addTextInput({id: "regpass", name: "password", label: "Password", password: true, value: datas.body && datas.body.password || "", alert: alert("password"), toolType: "At least one number, one lowercase and one uppercase letter, at least six characters that are letters, numbers or the underscore"})}
                        ${this.addTextInput({id: "regrepeat", name: "repeat", label: "Repeat password", password: true, value: "", alert: alert("repeat"), toolType: "Same as password"})}
                        ${this.addSubmitButton("Create configuration")}
                        </div>
                      </form>
                  </div>
                </div>
              </div>
            </body>                  
          </html>`];
    };
  }
