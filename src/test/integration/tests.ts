import fs from "fs";
import path from "path";
import { Iinfos, nbAdd, proxy } from "./constant";
import util from "util";

const _SEP = '```';
export const AddToTestFile = (datas: string): void => {
    fs.appendFile(path.resolve(__dirname, "../tests.md"), datas, function (err) {
        if (err) throw err;
      });
    };

export function addStartNewTest(title: string) {
    AddToTestFile(`\r\r## <a id="${title}">${title}</a>           [🚧](#start)\r\r`);
}

export function addGetTest(infos: Iinfos) {
    AddToTestFile(`   ${nbAdd()}. ${infos.api}\r [GET ${infos.url}](${proxy(true)}${encodeURI(infos.url)}) ✔️\r`);
}

export function addPostTest(infos: Iinfos, datas: any) {
    AddToTestFile(`  ${nbAdd()}. ${infos.api}\r [POST ${infos.url}](${proxy(true)}${encodeURI(infos.url)}) ✔️\r\n${postDatas(datas)}\r\n`);
    // AddToTestFile(`  ${nbAdd()}. ${infos.api}\r [POST ${infos.url}](${proxy(true)}${encodeURI(infos.url +"?$datas=" + btoa(JSON.stringify(datas)))}) ✔️\r\n${postDatas(datas)}\r\n`);
}
export function addPostFile(infos: Iinfos) {
    AddToTestFile(`  ${nbAdd()}. ${infos.api}\r [POST ${infos.url}](${proxy(true)}${encodeURI(infos.url)}) ✔️\r\n`);
    // AddToTestFile(`  ${nbAdd()}. ${infos.api}\r [POST ${infos.url}](${proxy(true)}${encodeURI(infos.url +"?$datas=" + btoa(JSON.stringify(datas)))}) ✔️\r\n${postDatas(datas)}\r\n`);
}
export function addPatchTest(infos: Iinfos, datas: any) {
    AddToTestFile(`  ${nbAdd()}. ${infos.api}\r [PATCH ${infos.url}](${proxy(true)}${encodeURI(infos.url)}) ✔️\r\n${postDatas(datas)}\r\n`);
    // AddToTestFile(`  ${nbAdd()}. ${infos.api}\r [PATCH ${infos.url}](${proxy(true)}${encodeURI(infos.url +"?$datas=" + btoa(JSON.stringify(datas)))}) ✔️\r\n${postDatas(datas)}\r\n`);

}
export function addDeleteTest(infos: Iinfos) {
    AddToTestFile(`  ${nbAdd()}. ${infos.api}\r [DELETE ${infos.url}](${proxy(true)}${encodeURI(infos.url)}) ✔️\r`);
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


