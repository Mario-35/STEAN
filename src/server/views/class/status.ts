/**
 * HTML Views Status for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { serverConfig } from "../../configuration";
import { _NOTOK, _OK } from "../../constants";
import { Iuser, koaContext } from "../../types";
import { CoreHtmlView } from "./core";
  

export class Status extends CoreHtmlView {

    constructor(ctx: koaContext, datas: Iuser) {
        super(ctx);
        this.status(datas);
    }
    
    public status(user: Iuser) {  
      const config = serverConfig.getConfigNameFromDatabase(user.database);  
      const url = `${this.ctx.decodedUrl.linkbase}/${this.ctx.config.apiVersion}`;  
      this._HTMLResult = [`
      <!DOCTYPE html>
        <html> 
            ${this.head( "Status", "user" )}
            <body>
                <div class="login-wrap">
                    <div class="login-html">
                        ${this.title("Status")}
                        <h3>Username : ${ user.username }</h3> 
                        <h3>Hosting : ${user.database == "all" ? "all" : config ? serverConfig.getConfig(config).pg.host : "Not Found"}</h3>
                        <h3>Database : ${user.database}</h3> <h3>Status : ${ user.id &&  user.id > 0 ? _OK : _NOTOK}</h3> 
                        ${this.foot([
                            { href: `${url}/Logout`, class: "button-logout", name: "Logout" },
                            { href: `${url}/Query`, class: "button-query", name: "Query" }
                        ])}
                    </div>
                </div>
            </body>
        </html>`];
    };

  }
