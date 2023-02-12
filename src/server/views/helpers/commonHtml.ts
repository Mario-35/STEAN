/**
 * Query Index HTML / JS maker.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

/* eslint-disable quotes */

import { _DBDATAS, _DBADMIN } from "../../db/constants";
import { message } from "../../logger";
import util from "util";
import { cleanUrl } from "../../helpers";
import { cssFile, listCssFiles } from "../css";
import { jsFile, listJsFiles } from "../js";
import { IQuery } from "../constant";
// import { getColumnsListType } from "../../db/helpers/";

const fileWithOutMin = (input: string): string => input.replace(".min",'');


export const commonHtml = (input: string, params: IQuery, ): string => {
    message(true, "HEAD", "commonHtml");
    message(true, "INFO", "params", params);
    const result: string[] = input.replace(/\r\n/g,'\n').split('\n').map((e:string) => e.trim());   
    params._DATAS = (params.admin === true ? _DBADMIN :  (params.user.admin === true || params.user.superAdmin === true) ? _DBDATAS : Object.fromEntries(Object.entries(_DBDATAS).filter(([k,v]) => v.admin === false)))
    ;
    
    const replaceInResult = (searhText: string, content: string) => {
        const index = result.indexOf(searhText);
        if (index > 0) result[index] = content;
    }

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


    listCssFiles().forEach((item: string) => {   
        const itemSearch = `<link rel="stylesheet" href="${fileWithOutMin(item)}">`;
        replaceInResult(itemSearch, `<style>${cssFile(item)}</style>`);
    });
    
    listJsFiles().forEach((item: string) => {   
        const itemSearch = `<script src="${fileWithOutMin(item)}"></script>`;
        replaceInResult(itemSearch, `<script>${jsFile(item)}</script>`);
        
    });

    return result.join("").replace("_PARAMS={}", "_PARAMS=" + util.inspect(params, { showHidden: false, depth: null }))
        .replace("// @start@", start)
        .replace("@action@", action);
};
