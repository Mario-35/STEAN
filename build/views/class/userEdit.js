"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.UserEdit=void 0;const core_1=require("./core");class UserEdit extends core_1.CoreHtmlView{constructor(e,d){super(e),this.userEdit(d)}userEdit=e=>{var d,t=e.body;return`<!DOCTYPE html>
              <html>
              ${this.head("Edit","user")}    
              <body>
                  <div class="login-wrap">
                    <div class="login-html">
                      <div class="login-form">
                        <form action="/user" method="post">
                            <input id="id" name="id" type="hidden" class="input"value="${t.id}">
                            ${this.addTextInput({id:"user",name:"username",label:"Username",value:t.username||""})}
                            ${this.addTextInput({id:"regmail",name:"email",label:"Email address",value:e.body&&e.body.email?e.body.email:"",alert:(d="email",e.why&&e.why[d]?`<div class="alert">${e.why[d]}</div>`:""),toolType:"A valid email address"})}
                            ${this.addTextInput({id:"database",name:"database",label:"Database",value:t.database||""})}
                            <table>
                              <tbody>
                                <tr>
                                  <td>${this.addCheckBox({id:"canPost",checked:t.canPost})}</td>
                                  <td>${this.addCheckBox({id:"canDelete",checked:t.canDelete})}</td>
                                </tr>
                                <tr>
                                  <td>${this.addCheckBox({id:"canCreateUser",checked:t.canCreateUser})}</td>
                                  <td>${this.addCheckBox({id:"canCreateDb",checked:t.canCreateDb})}</td>
                                </tr>
                                <tr>
                                  <td>${this.addCheckBox({id:"admin",checked:t.admin})}</td>
                                  <td>${this.addCheckBox({id:"superAdmin",checked:t.superAdmin})}</td>
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
          </html>`}}exports.UserEdit=UserEdit;