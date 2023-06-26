/**
 * Unprotected Routes for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { serverConfig } from "../../configuration";
import { Iuser } from "../../types";
import { addCssFile } from "../css";

export class CreateHtmlView {
    private ctx: koa.Context;
    private userHeader: {[key: string]: string} = Object.freeze({
      "canPost": "post",
      "canDelete": "Delete",
      "canCreateUser": "Create User",
      "canCreateDb": "Create DB",
      "admin": "admin",
      "superAdmin": "Super Admin"
  });

    constructor(ctx: koa.Context) {
        this.ctx = ctx;
    }

    private css = (name: string): string => {
        switch (name.toLowerCase()) {
            case "user":
                return addCssFile("userForm.css");
            default:
                return addCssFile("query.css");
        }
    };

    private head = (title: string, name: string): string => {
        return `<head> <meta charset="utf-8"> <style>${this.css(name)}</style> <title>${title}</title> </head>`;
    };

    private foot = (
        links: {
            href: string;
            class: string;
            name: string;
        }[]
    ): string => {
        const returnValue: string[] = ['<div class="hr"></div>'];
        links.forEach((element: { href: string; class: string; name: string }) => {
            returnValue.push(`<div class="inner"> <a href="${element.href}" class="${element.class}" >${element.name}</a> </div>`);
        });
        return returnValue.join();
    };

    addSubmitButton(label: string ) {
      return `<div class="group"> <input type="submit" class="button" value="${label}"> </div>`;
    }

    addButton(action: string, label: string ) {
      return `<div class="group"> <a href="${action}" class="button" >${label}</a> </div>`;
    }

    addCheckBox(input: {
      id: string, 
      checked: boolean, 
      label?: string
    }) {
      return `<div class="group"> <input id="${input.id}" type="checkbox" class="check" ${input.checked === true ? 'checked' : ''}> <label for="${input.id}"><span class="icon"></span> ${input.label ? input.label : input.id}</label> </div>`;
    }
    
    addTextInput(input: {
      id: string, 
      label: string, 
      value: any, 
      alert?: string, 
      name?: string, 
      toolType?: string,
      password?: boolean
    }) {
    return `<div class="group">
    <label for="${input.id}" class="label">${input.label}</label>
    ${ input.toolType ? `<div class='tooltip help'>
      <span>?</span>
      <div class='content'>
        <b></b>
        <p>${input.toolType}</p>
      </div>
      </div>` : ``
    }
    <input id="${input.id}" name="${input.name ? input.name : input.id}" type="${input.password ? input.password == true ? 'password' : 'text' : 'text' }" class="input" value="${input.value}">
    ${input.alert ? input.alert : ''}
  </div>`;
  }

    public config = (datas: { config: string | undefined ; body?: any; why?: {[key: string]: string} }): string => {
      try {
        const conf = serverConfig.configs["essai"];        
        // const conf = datas.config ? serverConfig.configs[datas.config] : serverConfig.createBlankConfig(this.ctx._configName);        
        const alert = (name: string): string => {
            return datas.why && datas.why[name] ? `<div class="alert">${datas.why[name]}</div>` : "";
        };
          return `<!DOCTYPE html>
          <html>
          ${this.head("Login", "user")}    
          <body>
              <div class="login-wrap">
                <div class="login-html">
                  <input id="tab-1" type="radio" name="tab" class="sign-in" checked>
                  <label for="tab-1" class="tab">Configuration</label>
                  <input id="tab-2" type="radio" name="tab" class="sign-up">
                  <label for="tab-2" class="tab">Database</label>
                  <div class="login-form">
                    <form action="${this.ctx._linkBase}/${this.ctx._version}/config" method="post">
                      <div class="sign-in-htm">
                        <div class="group">
                          <label for="user" class="label">config name</label>
                          <input id="configname" name="configname" type="text" class="input" value="${conf.name}" ${datas.config ? 'disabled' : ''}>
                        </div>
                        <table>
                          <tbody>
                          <tr>
                            <td> ${this.addCheckBox({id: "lora", checked: conf.lora})} </td>
                            <td> ${this.addCheckBox({id: "highPrecision", checked: conf.highPrecision})} </td>
                          </tr>
                          <tr>
                            <td> ${this.addCheckBox({id: "multiDatastream", checked: conf.multiDatastream})} </td>
                            <td> ${this.addCheckBox({id: "forceHttps", checked: conf.forceHttps})} </td>  
                          </tr>
                            <tr>
                              <td> ${this.addTextInput({id: "port", label: "Port", value: conf.port})} </td>
                              <td> ${this.addTextInput({id: "nbPage", label: "lines per page", value: conf.nb_page})} </td>
                            </tr>
                            <tr>
                              <td> ${this.addTextInput({id: "apiVersion", label: "Api version", value: conf.apiVersion})} </td>
                              <td> ${this.addTextInput({id: "logFile", label: "Logger File", value: conf.logFile})} </td>
                            </tr>
                          </tbody>
                        </table>  
                        <div class="group">
                        <input type="submit" class="button" value="${datas.config ? 'Update' : 'Add this config'}">
                        <div class="hr"></div>
                        </div>
                      </div>
                      <div class="sign-up-htm">
                        ${this.addTextInput({id: "host", label: "Host", value: conf.pg.host, alert: alert("host"), toolType: "PostgreSql database host"})}
                        ${this.addTextInput({id: "username", label: "User name", value: conf.pg.user, alert: alert("username"), toolType: "PostgreSql database username"})}
                        ${this.addTextInput({id: "password", label: "Password", value: conf.pg.password, alert: alert("dassword"), toolType: "PostgreSql database Password"})}
                        ${this.addTextInput({id: "database", label: "Database", value: conf.pg.database, alert: alert("database"), toolType: "PostgreSql database"})}
                        ${this.addTextInput({id: "port", label: "Port", value: conf.pg.port, alert: alert("port"), toolType: "PostgreSql database Port"})}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
  
  
          </body>                  
        </html>`;
      } catch (error) {
        return "Config bad";
      }

    };

    public login = (datas: { login: boolean; body?: any; why?: {[key: string]: string} }): string => {
        const alert = (name: string): string => {
            return datas.why && datas.why[name] ? `<div class="alert">${datas.why[name]}</div>` : "";
        };
        return `<!DOCTYPE html>
                  <html>
                  ${this.head("Login", "user")}    
                  <body>
                      <div class="login-wrap">
                        <div class="login-html">
                          <input id="tab-1" type="radio" name="tab" class="sign-in" ${
                              datas.login ? "checked" : ""
                          }><label for="tab-1" class="tab">Sign In</label>
                          <input id="tab-2" type="radio" name="tab" class="sign-up" ${
                              datas.login ? "" : "checked"
                          }><label for="tab-2" class="tab">Sign Up</label>
                          <div class="login-form">
                            <form action="${this.ctx._linkBase}/${this.ctx._version}/login" method="post">
                              <div class="sign-in-htm">
                                ${this.addTextInput({id: "user", name: "username", label: "Username", value: ""})}
                                ${this.addTextInput({id: "pass", name: "password", label: "Password", value: "", password: true})}
                                ${this.addCheckBox({id: "check", checked: true, label: "Keep me Signed in"})}
                                ${this.addSubmitButton("Sign In")}
                                <div class="hr"></div>
                                ${this.addButton(`${this.ctx._linkBase}/${this.ctx._version}/Query`, "Return to Query")}
                                <div class="foot-lnk">
                                  <a href="#forgot">Forgot Password?</a>
                                </div>
                              </div>
                            </form>
                  
                            <form action="/register" method="post">
                              <div class="sign-up-htm">
                                ${this.addTextInput({id: "regusername", name: "username", label: "Username", value: datas.body && datas.body.username ? datas.body.username : "", alert: alert("username"), toolType: "Name must be at least 2 words"})}
                                ${this.addTextInput({id: "regpass", name: "password", label: "Password", password: true, value: datas.body && datas.body.password ? datas.body.password : "", alert: alert("password"), toolType: "At least one number, one lowercase and one uppercase letter, at least six characters that are letters, numbers or the underscore"})}
                                ${this.addTextInput({id: "regrepeat", name: "repeat", label: "Repeat password", password: true, value: "", alert: alert("repeat"), toolType: "Same as password"})}
                                ${this.addTextInput({id: "regmail", name: "email", label: "Email address", value: datas.body && datas.body.email ? datas.body.email : "", alert: alert("email"), toolType: "A valid email address"})}
                                ${this.addSubmitButton("Sign UP")}
                                <div class="hr"></div>                                
                                <div class="foot-lnk">
                                  <label for="tab-1">Already Member ?</a>
                                </div>
                              </div>
                            </form>
                        </div>
                      </div>
                    </div>
                  </body>                  
                </html>`;
    };

    public userEdit = (datas: { body?: any; why?: {[key: string]: string} }): string => {
        const user = datas.body;
        const alert = (name: string): string => (datas.why && datas.why[name] ? `<div class="alert">${datas.why[name]}</div>` : "");
        return `<!DOCTYPE html>
                  <html>
                  ${this.head("Edit", "user")}    
                  <body>
                      <div class="login-wrap">
                        <div class="login-html">
                          <div class="login-form">
                            <form action="/user" method="post">
                                <input id="id" name="id" type="hidden" class="input"value="${user.id}">
                                ${this.addTextInput({id: "user", name: "username", label: "Username", value: user.username ? user.username : ""})}
                                ${this.addTextInput({id: "regmail", name: "email", label: "Email address", value: datas.body && datas.body.email ? datas.body.email : "", alert: alert("email"), toolType: "A valid email address"})}
                                ${this.addTextInput({id: "database", name: "database", label: "Database", value: user.database ? user.database : ""})}
                                <table>
                                <tbody>
                                <tr>
                                  <td>${this.addCheckBox({id: "canPost", checked: user.canPost})}</td>
                                  <td>${this.addCheckBox({id: "canDelete", checked: user.canDelete})}</td>
                                </tr>
                                <tr>
                                  <td>${this.addCheckBox({id: "canCreateUser", checked: user.canCreateUser})}</td>
                                  <td>${this.addCheckBox({id: "canCreateDb", checked: user.canCreateDb})}</td>
                                </tr>
                                <tr>
                                  <td>${this.addCheckBox({id: "admin", checked: user.admin})}</td>
                                  <td>${this.addCheckBox({id: "superAdmin", checked: user.superAdmin})}</td>
                                </tr>
                                </tbody>
                                </table>
                                <div class="group">
                                  <input type="submit" class="button" value="Update infos">
                                </div>
                            </form>
                          </div>
                        </div>
                      </div>
                  </body>
              </html>`;
    };

    public status = (user: Iuser): string => {
      const config = serverConfig.getConfigNameFromDatabase(user.database);  
        return `<!DOCTYPE html> <html> ${this.head(
            "Status",
            "user"
        )} <body> <div class="login-wrap"> <div class="login-html"> <h2>You are authenticated.</h2> <div class="hr"></div> <h3>Username : ${
            user.username
        }</h3> <h3>Hosting : ${user.database == "all" ? "all" : config ? serverConfig.configs[config].pg.host : "Not Found"}</h3> <h3>Database : ${user.database}</h3> <h3>Status : ${
            user.admin
        }</h3> ${user.superAdmin ? `<div class="inner"> <a href="${this.ctx._linkBase}/admin" class="button-admin" >users</a> </div>` : ""} ${this.foot([
            { href: this.ctx._linkBase + "/Logout", class: "button-logout", name: "Logout" },
            { href: this.ctx._linkBase + `/${this.ctx._version}/Query`, class: "button", name: "Query" }
        ])} </div> </div> </body> </html> `;
    };

    public error = (message: string): string => {
        return `<!DOCTYPE html> <html> ${this.head(
            "Error",
            "user"
        )} <body> <div class="login-wrap"> <div class="login-html"> <h1>Error.</h1> <div class="hr"></div> <h3>On error page</h3> <h3>${message}</h3> <div class="hr"></div> <div id="outer"> <div class="inner"> <a href="/Login" class="button-submit" >Login</a> </div> <div class="inner"> <a href="${
            this.ctx._linkBase + `/${this.ctx._version}/Query`
        }" class="button" >query</a> </div> </div> </div> </body> </html>`;
    };

    public infos = async (): Promise<string> => {
        return `<!DOCTYPE html> <html> ${this.head(
            "Infos",
            "user"
        )} <body> <div class="login-html"> <div class="table-wrapper"> <table class="fl-table"> <tbody>TODO</tbody></table> </div> ${this.foot([
            { href: this.ctx._linkBase + `/${this.ctx._version}/`, class: "button-submit", name: "Root" },
            { href: this.ctx._linkBase + `/${this.ctx._version}/Query`, class: "button", name: "Query" },
            { href: `${serverConfig.configs[this.ctx._configName].webSite}`, class: "button-logout", name: "Documentation" }
        ])} </div> </body> </html> `;
    };

    public admin = (user: Iuser, Host: string, version: string): string => {
        return `<!DOCTYPE html> <html> <head> <title>Admin</title> <style> var crudApp=new function(){this.users={},this.userHeader=${this.userHeader},this.category=["Business","Computers","Programming","Science"],this.col=[],this.loadDatas=async function(){document.ctx.includes("/Admin")?document.ctx.split("/Admin")[0]:document.ctx.includes("/admin")&&document.ctx.split("/admin")[0];let t=await fetch("/all",{method:"GET",headers:{"Content-Type":"application/json"}});try{var e=await t.text();this.users=JSON.parse(e)}catch(t){console.log("Error",t.message)}},this.createTable=async function(){await this.loadDatas(),this.col=Object.keys(this.users[0]).filter(t=>"id"!=t.toLowerCase());var t=document.createElement("table");t.setAttribute("class","fl-table"),t.setAttribute("id","usersTable");for(var e=t.insertRow(-1),i=0;i<this.col.length;i++){var s=document.createElement("th");const t=this.userHeader[this.col[i]]?this.userHeader[this.col[i]]:this.col[i];s.innerHTML=t,e.appendChild(s)}this.td=document.createElement("td"),e.appendChild(this.td);var n=document.createElement("input");n.setAttribute("type","button"),n.setAttribute("value","Add"),n.setAttribute("id","New"+r),n.setAttribute("class","btn_submit _submit"),n.setAttribute("onclick","crudApp.CreateNew()"),this.td.appendChild(n);for(var r=0;r<this.users.length;r++){e=t.insertRow(-1);for(var a=0;a<this.col.length;a++){var d=e.insertCell(-1);const t=this.users[r][this.col[a]];d.innerHTML="true"==t.toString()?"✔":"false"==t.toString()?"✖":t.toString()}this.td=document.createElement("td"),e.appendChild(this.td);var c=document.createElement("input");c.setAttribute("type","button"),c.setAttribute("value","Edit"),c.setAttribute("id","Edit"+r),c.setAttribute("class","btn_go _go"),c.setAttribute("onclick",`;
    };

  }
