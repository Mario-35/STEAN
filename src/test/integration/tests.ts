import fs from "fs";
import path from "path";
import { Iinfos, nbAdd, proxy } from "./constant";
import util from "util";
export const _LOG: string[] = [];
let _INDEX = 0;
export function writeLog(ok: boolean) {
    if (ok === true) _LOG[_INDEX] = _LOG[_INDEX].replace('❌', '✔️');
    fs.writeFile(path.resolve(__dirname, "../tests.md"), _LOG.join('\r'), function () {});
}

// const createJSON = (data: any) => JSON.stringify(data, null, 4).replace(/[\n]+/g, "|\t");

const _SEP = '```';
export const AddToTestFile = (datas: string): void => {
    _LOG.push(datas);
    };

export function addStartNewTest(title: string) {
    _LOG.push(`\r\r## <a id="${title.replace(/[ ]+/g, "")}">${title}</a>           [🚧](#start)\r\r`);
}

export function addTest(infos: Iinfos): Iinfos {
    const verb = infos.api.split("}")[0].split("{")[1];
    _LOG.push(`   ${nbAdd()}. ${infos.api}\r [${verb ? verb.toUpperCase() : "GET"} ${infos.url}](${proxy(true)}${encodeURI(infos.url)}) ❌`);
    _INDEX = _LOG.length - 1;
    if(infos.apiParamExample) _LOG.push(postDatas(infos.apiParamExample));
    writeLog(false);
    return infos;
}


export function addPostFile(infos: Iinfos) {
    _LOG.push(`  ${nbAdd()}. ${infos.api}\r [POST ${infos.url}](${proxy(true)}${encodeURI(infos.url)}) ✔️\r\n`);
}

export const postDatas = (input: any): string =>  `${_SEP}js\r\n${util.inspect(input, { breakLength: Infinity, showHidden: true, depth: Infinity })} \r\n${_SEP}\r\n`;

export const addToTests = (options: {
    title:  string;
    verb:  string;
    link:  string;
    datas:  string | undefined;
    ok:  boolean;
}): void => {
    let str = `### ${options.title}\r`;
    if (options.datas) {
        const encoded = btoa(options.datas);
        const url = `${options.link}?$query=${encoded}`;
        str += `[${options.verb} ${options.link}](${url}) ${ options.ok === true ? '✔️' : '❌' }\r`
        str += '```json\r';
        str += options.datas;
        str += '```\r';
    } else str += `[${options.verb} ${options.link}](${proxy(true)}${options.link}) ${ options.ok === true ? '✔️' : '❌' }\r`

    AddToTestFile(str);
   };


