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
import { getColumnsListType } from "../../db/helpers/";
import { IEntityColumnForm } from "../../types";

export const commonHtml = (input: string, params: IQuery, ): string => {
    message(true, "HEAD", "commonHtml");
    message(true, "INFO", "params", params);
    const result: string[] = input.replace(/\r\n/g,'\n').split('\n').map((e:string) => e.trim());
    const _SOURCE = (params.admin === true ? _DBADMIN :  (params.user.admin === true || params.user.superAdmin === true) ? _DBDATAS : Object.fromEntries(Object.entries(_DBDATAS).filter(([k,v]) => v.admin === false)))
    ;
    
    const replaceInResult = (searhText: string, content: string) => {
        const index = result.indexOf(searhText);
        if (index > 0) result[index] = content;
    }

    const relations: { [key: string]: string[] } = {};
    const columns: { [key: string]: { [key: string]: IEntityColumnForm } } = {};
    const action = `${params.host}/${params.version}/CreateObservations`;
    const singulars:{ [key: string]: string } = {};
    Object.keys(_SOURCE).forEach((elem: string) =>{
        singulars[_SOURCE[elem].singular] = _SOURCE[elem].name;
    });
    
    Object.keys(_SOURCE)
    .filter((elem: string) => _DBDATAS[elem].order > 0)
    .sort((a, b) => (_DBDATAS[a].order > _DBDATAS[b].order ? 1 : -1))    
        .forEach((key: string) => {
            if (key == "CreateObservations") {
                if (params.user && params.user.canPost && params.user.canPost == true) relations[key] = Object.keys(_SOURCE[key].relations);
            } else {                
                relations[key] = Object.keys(_SOURCE[key].relations);
                if(_SOURCE[key].admin === false || (_SOURCE[key].admin === true && (params.user.superAdmin === true || params.user.admin === true))) {
                    const temp = getColumnsListType(key);
                    if (temp) columns[key] = temp; 
                }
            }
        });

    // if (params.user && params.user.canCreateDb && params.user.canCreateDb == true) relations["createDB"] = [];
    

    const start = params.results ? "jsonObj = JSON.parse(`" + params.results + "`); jsonViewer.showJSON(jsonObj);" : "";

    if (params.user.canPost) {
        params.methods.push("POST");
        params.methods.push("PATCH");
    }

    if (params.user.canDelete) params.methods.push("DELETE");
    params.relations = params.admin === true ? undefined : relations;
    params.columns = columns;
    params.singulars = singulars;

    if (params.options) {
        let essai = params.options;
        if (params.options.includes("options=")) {
            const temp = params.options.split("options=");
            params.options = temp[1];
            essai = temp[0];
        } else params.options = "";
        const splitOptions = essai.split("&");
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

    params.entities = Object.keys(_SOURCE);

    listCssFiles().forEach((item: string) => {   
        const itemSearch = `<link rel="stylesheet" href="${item}">`;
        replaceInResult(itemSearch, `<style>${cssFile(item)}</style>`);
    });
    
    listJsFiles().forEach((item: string) => {   
        const itemSearch = `<script src="${item}"></script>`;
        replaceInResult(itemSearch, `<script>${jsFile(item)}</script>`);
        
    });

    return result.join("").replace("params={}", "params =" + util.inspect(params, { showHidden: false, depth: null }))
        .replace("// @start@", start)
        .replace("@action@", action);
        
        
};
