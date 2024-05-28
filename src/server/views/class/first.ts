/**
 * HTML Views First Install for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- HTML Views First Install for API. -----------------------------------!");

import { EnumExtensions, enumKeys, EnumOptions, EnumVersion } from "../../enums";
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
            <script>
            var expanded = false;

            function showCheckboxes(checkboxes) {
              if (!expanded) {
                checkboxes.style.display = "block";
                expanded = true;
              } else {
                checkboxes.style.display = "none";
                expanded = false;
              }
            }
            </script> 
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
                        <table>
                          <tr>
                          <td> ${this.addTextInput({name: "servicename", label: "Service name", value: datas.body && datas.body.regservice || "", alert: alert("service"), toolType: "Name must be at least 5 chars"})} </td>
                          <td> ${this.addTextInput({name: "serviceport", label: "Port", value: datas.body && datas.body.regservice || "5432", alert: alert("service"), toolType: "Name must be have 4 numbers"})} </td>
                          </tr>
                          <tr>
                            <td> ${this.addTextInput({name: "servicehost", label: "Host name", value: datas.body && datas.body.regservicehost || "localhost", alert: alert("host"), toolType: "Host must be at least 5 chars"})} </td>
                            <td> ${this.addTextInput({name: "serviceusername", label: "Username", value: datas.body && datas.body.regserviceusername || "", alert: alert("username"), toolType: "Name must be at least 5 chars"})} </td>
                            </tr>
                          <tr>
                            <td> ${this.addTextInput({name: "servicepassword", label: "Password", password: true, value: datas.body && datas.body.service || "", alert: alert("password"), toolType: "At least one number, one lowercase and one uppercase letter, at least six characters that are letters, numbers or the underscore"})} </td>
                            <td> ${this.addTextInput({name: "servicerepeat", label: "Repeat password", password: true, value: "", alert: alert("repeat"), toolType: "Same as password"})} </td>
                            </tr>
                            <tr>
                            <td> ${this.addTextInput({name: "servicedatabase", label: "Database name", value: "", alert: alert("database"), toolType: "name of psotgresSql database"})} </td>
                            <td> ${this.addSelect({name: "serviceversion", list: enumKeys(EnumVersion).map(e => e.replace("_", ".")) , message: "Select version", password: true, value: "", alert: alert("repeat"), toolType: "Same as password"})} </td>
                          </tr>
                          <tr>
                            <td class="onTop">
                            ${this.addMultiSelect({name: "serviceextensions", list: enumKeys(EnumExtensions) , message: "Select extensions"})}                            
                            </td>
                            <td class="onTop">
                            ${this.addMultiSelect({name: "serviceoptions", list: enumKeys(EnumOptions) , message: "Select Options"})}                            
                            </td>
                          </tr>
                          </table>
                        </div> 
                        <div class="sign-up-htm">
                        ${this.addTextInput({name: "host", label: "Host name", value: datas.body && datas.body.host || "localhost", alert: alert("host"), toolType: "Host must be at least 5 chars"})}
                        ${this.addTextInput({name: "username", label: "Username", value: datas.body && datas.body.username || "", alert: alert("username"), toolType: "Name must be at least 5 chars"})}
                        ${this.addTextInput({name: "password", label: "Password", password: true, value: datas.body && datas.body.password || "", alert: alert("password"), toolType: "At least one number, one lowercase and one uppercase letter, at least six characters that are letters, numbers or the underscore"})}
                        ${this.addTextInput({name: "repeat", label: "Repeat password", password: true, value: "", alert: alert("repeat"), toolType: "Same as password"})}
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
