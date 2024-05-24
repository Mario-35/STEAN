"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Status=void 0;const configuration_1=require("../../configuration"),constants_1=require("../../constants"),core_1=require("./core");class Status extends core_1.CoreHtmlView{constructor(t,s){super(t),this.status(t,s)}status(t,s){var e=configuration_1.serverConfig.getConfigNameFromDatabase(s.database),o=this.ctx.decodedUrl.linkbase+"/"+this.ctx.config.apiVersion;this._HTMLResult=[`
      <!DOCTYPE html>
        <html> 
            ${this.head("Status","user")}
            <body>
                <div class="login-wrap">
                    <div class="login-html">
                        ${this.title("Status")}
                        <h3>Username : ${s.username}</h3> 
                        <h3>Hosting : ${"all"==s.database?"all":e?configuration_1.serverConfig.getConfig(e).pg.host:"Not Found"}</h3>
                        <h3>Database : ${s.database}</h3> <h3>Status : ${s.id&&0<s.id||!1===t.config.users?constants_1._OK:constants_1._NOTOK}</h3> 
                        ${this.foot([{href:o+"/Logout",class:"button-logout",name:"Logout"},{href:o+"/Query",class:"button-query",name:"Query"}])}
                    </div>
                </div>
            </body>
        </html>`]}}exports.Status=Status;