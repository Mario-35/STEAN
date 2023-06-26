/**
 * Query Index HTML / JS maker.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

/* eslint-disable quotes */
import Koa from "koa";
import fs from "fs";
import { serverConfig } from "../../configuration";
import { Logs } from "../../logger";
import { addCssFile, listaddCssFiles } from "../css";
import { addJsFile, listaddJsFiles } from "../js";
import { fileWithOutMin } from "../helpers";
import { ADMIN } from "../../constants";

export const createAdminHtml = async (ctx: Koa.Context, list: boolean): Promise<string> => {
    
    const addCheckBox = (elem: string, value: boolean): string => `<input id="${elem}" type="checkbox" class="check" ${value === true ? 'checked': ''}>`;

    const result = fs.readFileSync(__dirname + "/admin.html").toString().replace(/\r\n/g,'\n').split('\n').map((e:string) => e.trim()); 
    const replaceInResult = (searhText: string, content: string) => {
        const index = result.indexOf(searhText);
        if (index > 0) result[index] = content;
    };

    Logs.head("createAdminHtml");
    const tempConfig: string[] = [];
    const tempUser: string[] = [];
    if (list === false) {
        const datas = await serverConfig.db(ADMIN).raw("SELECT DISTINCT name FROM config ORDER BY name");
        if (datas.rows.length > 0) {
            datas.rows.forEach((elem: string) => {
                tempConfig.push(`
                <tr>
                    <td>${elem}</td>
                    <td>
                    <a class='button' href='#'>Edit</a>
                    </td>
                </tr>
              `);
            });
        } 
    } else {
        const datas = Object.keys(serverConfig.configs);
        datas.forEach((elem: string) => {
            tempConfig.push(`
            <tr>
                <td>${elem}</td>
                <td>
                    <a class='button' href='${ctx._linkBase}/EDITCONFIG?$name=${elem}'>Edit</a>
                </td>
                <td>
                    ${addCheckBox(elem, false)}
                </td>
            </tr>
          `);
        });
        
    }
    replaceInResult("DATASCONFIG", tempConfig.join(""));
    
    const users = await serverConfig.db(ADMIN).raw('SELECT * FROM "user"');
    users.rows.forEach((elem: string) => {
        tempUser.push(`
        <tr>
            <td>${elem["username"]}</td>
            <td>${elem["email"]}</td>
            <td>${elem["database"]}</td>
            <td>${addCheckBox(elem, elem["canPost"])}</td>
            <td>${addCheckBox(elem, elem["canDelete"])}</td>
            <td>${addCheckBox(elem, elem["canCreateUser"])}</td>
            <td>${addCheckBox(elem, elem["canCreateDb"])}</td>
            <td>${addCheckBox(elem, elem["admin:"])}</td>
            <td>${addCheckBox(elem, elem["superAdmin:"])}</td>            
            <td>
                <a class='button' href='${ctx._linkBase}/EDITUSER?$name=${elem["username"]}'>Edit</a>
            </td>
        </tr>
      `);
    });
    
    replaceInResult("DATASUSER", tempUser.join(""));
    
    listaddCssFiles().forEach((item: string) => replaceInResult(`<link rel="stylesheet" href="${fileWithOutMin(item)}">`, `<style>${addCssFile(item)}</style>`));
    
    listaddJsFiles().forEach((item: string) => replaceInResult(`<script src="${fileWithOutMin(item)}"></script>`, `<script>${addJsFile(item)}</script>`));

    return result.join("").replace("URLINK", `${ctx._linkBase}/${ctx._version}`);
};
