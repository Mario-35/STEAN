/**
 * HTML Views Core for API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { koaContext } from "../../types";
import { addCssFile } from "../css";

export class CoreHtmlView {
    ctx: koaContext;
    _HTMLResult: string[];
    
    constructor(ctx: koaContext, datas?: string | string[]) {
      this.ctx = ctx;
      this._HTMLResult = datas ? typeof datas === 'string' ? [datas] : datas : [];
    }
    
    css(name: string): string {
      return name.toLowerCase() === "user" ? addCssFile("userForm.css") : addCssFile("query.css");
    }
    
    title(message: string): string {
      return `<div class="title">${message}</div>`;
    }    
    
    hr(): string {
      return '<div class="hr"></div>';
    }

    head (title: string, name: string): string {
      return `<head>
                <meta charset="utf-8">
                <style>${this.css(name)}</style>
                <title>${title}</title>
              </head>`;
    };

    foot( links: { href: string; class: string; name: string; }[] ): string  {
        const returnValue: string[] = [this.hr()];
        links.forEach((element: { href: string; class: string; name: string }) => {
            returnValue.push(`
            <div class="inner">
              <a  href="${element.href}" 
                  class="${element.class}">${element.name}</a>
            </div>`);
        });
        return returnValue.join();
    };
    
    addSubmitButton(label: string ) {
      return `<div class="group">
                <input type="submit" class="button" value="${label}">
              </div>`;
    }

    addButton(action: string, label: string ) {
      return `<div class="group">
                <a href="${action}" class="button" >${label}</a>
              </div>`;
    }

    addCheckBox(input: { id: string, checked: boolean, label?: string }) {
      return `<div class="group"> 
                <input  id="${input.id}" 
                        type="checkbox" 
                        class="check"${input.checked === true ? ' checked' : ''}> 
                <label for="${input.id}"><span class="icon"></span>${input.label ? input.label : input.id}</label>
              </div>`;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addTextInput(input: { id: string, label: string, value: any, alert?: string, name?: string, toolType?: string, password?: boolean }) {
      return `<div class="group">
                <label  for="${input.id}" 
                        class="label">${input.label}
                </label>
                ${ input.toolType ? `<div class='tooltip help'>
                                        <span>?</span>
                                        <div class='content'>
                                          <b></b>
                                          <p>${input.toolType}</p>
                                        </div>
                                      </div>` 
                                      : ``
                }
                <input  id="${input.id}" 
                        name="${input.name ? input.name : input.id}" 
                        type="${input.password ? input.password == true ? 'password' : 'text' : 'text' }" 
                        class="input" 
                        value="${input.value}">
                ${input.alert ? input.alert : ''}
              </div>`;
    }

    toArray() {
      return this._HTMLResult;
    }

    toString() {
      return this._HTMLResult.filter(e => e !== "").join("");
    }
  }
