/**
 * Utils.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
export const removeFirstOrEnd = (input: string, char: string) => {    
    while (input[0] === char[0]) input = input.slice(1).trim();
    while (input[input.length - 1] === char[0]) input = input.slice(0, -1);
    return input;
}

const addQuotes = (input: string, Quotes: string): string => { input = removeFirstOrEnd(input,Quotes) ; return `${input[0] !== Quotes ? Quotes : ''}${input}${input[input.length - 1] !== Quotes ? Quotes : ''}`};
export const addDoubleQuotes = (input: string): string => addQuotes(input, '"');

export const removeFirstAndEnd = (input: string, char: string) => input[0] === char && input[input.length - 1] === char[0] ? input.slice(0, -1).slice(1).trim() : input;

export const removeDoubleQuotes = (input: string) => removeFirstAndEnd(input, '"');
export const removeSimpleQuotes = (input: string) => removeFirstAndEnd(input, "'");
export const addSimpleQuotes = (input: string): string => addQuotes(input, "'");
export const getUserId = (ctx: koa.Context): number => ctx.state.user && ctx.state.user.id ? ctx.state.user.id : -1;
export const removeAllQuotes = (input: string): string => input.replace(/['"]+/g, "");
export const unikeList = (input: string[]) => [...new Set(input)];
export const testStringsIn = (tests: string[], input: string): boolean => tests.map(e => input.includes(e) ? true : false).filter(e => e === true).length > 0;
export const jsonForPosgresSql = (input: object) => {
    console.log("===================== jsonForPosgresSql ==============================");
    const tmp =  JSON.stringify(input);
    console.log(tmp);
    
    return tmp[0] === "[" ? tmp : addSimpleQuotes(tmp);
}

export { asyncForEach } from "./asyncForEach";
export { cleanStringComma } from "./cleanStringComma";
export { cleanUrl } from "./cleanUrl";
export { createBearerToken } from "./createBearerToken";
export { deepClone } from "./deepClone";
export { encrypt, decrypt } from "./crypto";
export { getBigIntFromString } from "./getBigIntFromString";
export { getUrlId } from "./getUrlId";
export { getUrlKey } from "./getUrlKey";
export { hideKeysInJson } from "./hideKeysInJson";
export { hidePassword} from "./hidePassword";
export { isTest, isProduction, isCsvOrArray, isGraph, isObservation, isAdmin, isAllowedTo, isObject, isObjectArray } from "./tests";
export { notNull, isNull } from "./notNull";
export { bigIntReplacer } from "./bigIntReplacer";
export { returnFormats } from "./returnFormats";
export { removeEmpty } from "./removeEmpty";
export { upload } from "./upload";
