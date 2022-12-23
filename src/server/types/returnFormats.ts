/**
 * Formats interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";

export const enum FORMATS {    
    json = "json", 
    csv = "csv",
    txt = "txt", 
    html = "html", 
    icon = "icon", 
    graph = "graph", 
    graphDatas = "graphDatas", 
    dataArray = "dataArray", 
    css = "css", 
    js = "js", 
    png = "png", 
    jpg = "jpg", 
    jpeg = "jpeg", 
    ico = "ico"
}

 export interface IreturnFormat {
    type: string; 
    format(input: string | Object, ctx?: koa.Context): string | Object;
}

