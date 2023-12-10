/**
 * Query Index HTML / JS maker.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

/* eslint-disable quotes */

import { Logs } from "../../logger";
import { cleanUrl, removeAllQuotes, replacer } from "../../helpers";
import { addCssFile, listaddCssFiles } from "../css";
import { addJsFile, listaddJsFiles } from "../js";
import { APP_VERSION } from "../../constants";
import { IqueryOptions } from "../../types";

const fileWithOutMin = (input: string): string => input.replace(".min",'');

export const commonHtml = (input: string, params: IqueryOptions): string => {
    Logs.head("commonHtml");
    Logs.debug("params", params); 
    const result: string[] = input
                            .replace(/<link /g,'\n<link ')
                            .replace(/<script /g,'\n<script ')
                            .replace(/<\/script>/g,'</script>\n')
                            .replace(/\r\n/g,'\n')
                            .split('\n')
                            .map((e:string) => e.trim())  
                            .filter(e => e.trim() != "");
    
    const replaceInResult = (searhText: string, content: string) => {
        let index = result.indexOf(searhText);
        if (index > 0) result[index] = content;
        else {
            index = result.indexOf(removeAllQuotes(searhText));
            if (index > 0) result[index] = content;
        }
    };

    const action = `${params.host}/${params.version}/CreateObservations`;    

    const start = params.results ? "jsonObj = JSON.parse(`" + params.results + "`); jsonViewer.showJSON(jsonObj);" : "";

    if (params.user.canPost) {
        params.methods.push("POST");
        params.methods.push("PATCH");
    } 

    if (params.user.canDelete) params.methods.push("DELETE");

    if (params.options) {
        let tempOptions = params.options;
        if (params.options.includes("options=")) {
            const temp = params.options.split("options=");
            params.options = temp[1];
            tempOptions = temp[0];
        } else params.options = "";
        const splitOptions = tempOptions.split("&");
        const valid = ["method", "id", "entity", "subentity", "property", "onlyValue"];
        splitOptions.forEach((element: string) => {
            if (element.includes("=")) {
                const temp = element.split("=");
                if (temp[0] && temp[1])
                    if (valid.includes(temp[0])) params[temp[0]] = cleanUrl(temp[1]);
                    else if (temp[0] == "datas") params.datas = JSON.parse(unescape(temp[1]));
            }
        });
    }

    listaddCssFiles().forEach((item: string) => {
        replaceInResult(`<link rel="stylesheet" href="${fileWithOutMin(item)}">`, `<style>${addCssFile(item)}</style>`);
    });
    
    listaddJsFiles().forEach((item: string) => {  
        replaceInResult(`<script src="${fileWithOutMin(item)}"></script>`, `<script>${addJsFile(item)}</script>`);
    });
    
    return result.join("").replace("_PARAMS={}", "_PARAMS=" + JSON.stringify(params, replacer))
        .replace("// @start@", start)
        .replace("@version@", APP_VERSION)
        .replace("@action@", action);
};
