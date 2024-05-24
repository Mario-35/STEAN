"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.HtmlError=void 0;const core_1=require("./core");class HtmlError extends core_1.CoreHtmlView{constructor(r,e){super(r),this.error(e)}error(r){this._HTMLResult=[`
        <!DOCTYPE html>
            <html>
                ${this.head("Error","user")}
                <body>
                    <div class="login-wrap">
                        <div class="login-html">
                            ${this.title("Error")}
                            <h1>Error.</h1>
                            <div class="hr">
                            </div>
                            <h3>On error page</h3> <h3>${r}</h3>
                            ${this.hr()}
                            <div id="outer">
                                <div class="inner">
                                    <a href="/Login" class="button-submit">Login</a>
                                </div>
                                <div class="inner">
                                    <a  href="${this.ctx.decodedUrl.linkbase+`/${this.ctx.config.apiVersion}/Query`}" class="button">query</a>
                                </div>
                            </div>
                        </div>
                    </body>
                </html>`]}}exports.HtmlError=HtmlError;