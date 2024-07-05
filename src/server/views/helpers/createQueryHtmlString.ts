/**
 * createQueryHtmlString
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- createQueryHtmlString -----------------------------------!");

import { cleanUrl, removeAllQuotes } from "../../helpers";
import { addCssFile, listaddCssFiles } from "../css";
import { addJsFile, listaddJsFiles } from "../js";
import { APP_VERSION } from "../../constants";
import { IqueryOptions } from "../../types";
import { log } from "../../log";

export function createQueryHtmlString(input: string, params: IqueryOptions): string {
    console.log(log.debug_head("commonHtml"));
    const bigIntReplacer = <K,V>(key: K, value: V) => typeof value === "bigint" ? value.toString() : value;
    // if js or css .min
    const fileWithOutMin = (input: string): string => input.replace(".min",'');
    // Split files for better search and replace
    const result: string[] = input
                            .replace(/<link /g,'\n<link ')
                            .replace(/<script /g,'\n<script ')
                            .replace(/<\/script>/g,'</script>\n')
                            .replace(/\r\n/g,'\n')
                            .split('\n')
                            .map((e:string) => e.trim())  
                            .filter(e => e.trim() != "");
    
    // replace in result
    const replaceInReturnResult = (searhText: string, content: string) => {
        let index = result.indexOf(searhText);
        if (index > 0) result[index] = content;
        else {
            index = result.indexOf(removeAllQuotes(searhText));
            if (index > 0) result[index] = content;
        }
    };

    // users possibilities
    if (params.user.canPost) {
        params.methods.push("POST");
        params.methods.push("PATCH");
        if (params.user.canDelete) params.methods.push("DELETE");
    } 

    // Format params
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
                if (temp[0] && temp[1]) {
                    // @ts-ignore
                    if (valid.includes(temp[0])) params[temp[0]] = cleanUrl(temp[1]);
                    else if (temp[0] == "datas") params.datas = JSON.parse(unescape(temp[1]));
                }
            }
        });
    }

    // process all css files
    listaddCssFiles().forEach((item: string) => {
        replaceInReturnResult(`<link rel="stylesheet" href="${fileWithOutMin(item)}">`, `<style>${addCssFile(item)}</style>`);
    });
    
    // process all js files
    listaddJsFiles().forEach((item: string) => {  
        replaceInReturnResult(`<script src="${fileWithOutMin(item)}"></script>`, `<script>${addJsFile(item)}</script>`);
    });
    
    // return html as a string
    return result.join("").replace("_PARAMS={}", "_PARAMS=" + JSON.stringify(params, bigIntReplacer))
        // execute a start of query
        .replace("// @start@", params.results ? "jsonObj = JSON.parse(`" + params.results + "`); jsonViewer.showJSON(jsonObj);" : "")
        // App version on query
        .replace("@version@", APP_VERSION)
        // default action form
        .replace("@action@", `${params.decodedUrl.root}/${params.decodedUrl.version}/CreateObservations`);
};
