/**
 * HTML Views UserEdit for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- HTML Views UserEdit for API. -----------------------------------!");
import { IKeyString, koaContext } from "../../types";
import { CoreHtmlView } from "./core";

interface Idatas {
  body?: any; 
  why?: IKeyString
}

export class UserEdit extends CoreHtmlView {
    constructor(ctx: koaContext, datas: Idatas) {
        super(ctx);
        this.userEdit(datas);
    }

    private userEdit = (datas: Idatas): string => {
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
                            ${this.addTextInput({name: "username", label: "Username", value: user.username ? user.username : ""})}
                            ${this.addTextInput({name: "email", label: "Email address", value: datas.body && datas.body.email ? datas.body.email : "", alert: alert("email"), toolType: "A valid email address"})}
                            ${this.addTextInput({name: "database", label: "Database", value: user.database ? user.database : ""})}
                            <table>
                              <tbody>
                                <tr>
                                  <td>${this.addCheckBox({name: "canPost", checked: user.canPost})}</td>
                                  <td>${this.addCheckBox({name: "canDelete", checked: user.canDelete})}</td>
                                </tr>
                                <tr>
                                  <td>${this.addCheckBox({name: "canCreateUser", checked: user.canCreateUser})}</td>
                                  <td>${this.addCheckBox({name: "canCreateDb", checked: user.canCreateDb})}</td>
                                </tr>
                                <tr>
                                  <td>${this.addCheckBox({name: "admin", checked: user.admin})}</td>
                                  <td>${this.addCheckBox({name: "superAdmin", checked: user.superAdmin})}</td>
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
    

  }
