/**
 * HTML Views First for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EnumVersion } from "../../enums";
import { IconfigFile, IKeyString, koaContext } from "../../types";
import { CoreHtmlView } from "./core";

interface Idatas { 
  login: boolean; 
  url: string; 
  config: IconfigFile; 
  body?: any; 
  why?: IKeyString
}


export class Config extends CoreHtmlView {
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
            ${this.title(this.ctx.config.name)}
                    <input  id="tab-1" 
                            type="radio" 
                            name="tab" 
                            class="sign-in" checked>
                    <label for="tab-1" class="tab">Service</label>
                    <input  id="tab-2" 
                            type="radio" 
                            name="tab" 
                            class="sign-up">
                    <label for="tab-2" class="tab">Options</label>
                    <div class="login-form">
                      <form action="${datas.url}" method="post">
                        <div class="sign-in-htm">
                        ${this.addTextInput({id: "regapiversion", name: "apiversion", label: "Version", value: datas.body && datas.body.apiversion || this.ctx.config.apiVersion, alert: alert("apiversion"), toolType: Object.values(EnumVersion).join()})}
                        ${this.addTextInput({id: "regdate_format", name: "date_format", label: "Date format", value: datas.body && datas.body.date_format || this.ctx.config.date_format, alert: alert("date_format"), toolType: "Host must be at least 2 words"})}
                        ${this.addTextInput({id: "regwebSite", name: "webSite", label: "Web Site", value: datas.body && datas.body.regwebSite || this.ctx.config.webSite, alert: alert("webSite"), toolType: "Name must be at least 2 words"})}
                        ${this.addTextInput({id: "regnb_page", name: "nb_page", label: "nb page", value: datas.body && datas.body.nb_page || this.ctx.config.nb_page, alert: alert("nb_page"), toolType: "Name must be at least 2 words"})}
                        ${this.addTextInput({id: "logFile", name: "logFile", label: "log File", value: datas.body && datas.body.logFile || this.ctx.config.logFile, alert: alert("logFile"), toolType: "Name must be at least 2 words"})}
                        </div>
                        <div class="sign-up-htm">
                        ${this.addCheckBox({id: "forceHttps", checked: datas.body && datas.body.forceHttps === true || this.ctx.config.forceHttps , label: " force Https"})}
                        ${this.addCheckBox({id: "stripNull", checked: datas.body && datas.body.stripNull === true || this.ctx.config.stripNull , label: " strip Null"})}
                        ${this.addCheckBox({id: "highPrecision", checked: datas.body && datas.body.highPrecision === true || this.ctx.config.highPrecision , label: " high Precision"})}
                        ${this.addCheckBox({id: "canDrop", checked: datas.body && datas.body.canDrop === true || this.ctx.config.canDrop , label: " can Drop"})}
                        </div>
                      </form>
                  </div>
                </div>
              </div>
            </body>                  
          </html>`];
    };
  }
