/**
 * Utils.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
const addQuotes = (input: string, Quotes: string): string => `${input[0] !== Quotes ? Quotes : ''}${input}${input[input.length - 1] !== Quotes ? Quotes : ''}`;
export const addDoubleQuotes = (input: string): string => addQuotes(input, '"');
export const addSimpleQuotes = (input: string): string => addQuotes(input, "'");
export const getUserId = (ctx: koa.Context): number => ctx.state.user && ctx.state.user.id ? ctx.state.user.id : -1;
export const removeAllQuotes = (input: string): string => input.replace(/['"]+/g, "");
export const unikeList = (input: string[]) => [...new Set(input)];

export { asyncForEach } from "./asyncForEach";
export { cleanStringComma } from "./cleanStringComma";
export { cleanUrl } from "./cleanUrl";
export { configCtx } from "./showconfigCtx";
export { createBearerToken } from "./createBearerToken";
export { deepClone } from "./deepClone";
export { encrypt, decrypt } from "./crypto";
export { getBigIntFromString } from "./getBigIntFromString";
export { getUrlId } from "./getUrlId";
export { getUrlKey } from "./getUrlKey";
export { hideKeysInJson } from "./hideKeysInJson";
export { hidePasswordIn, hidePasswordInJSON } from "./hidePasswordIn";
export { isTest, isProduction, isCsvOrArray, isGraph, isObservation, isAdmin, isAllowedTo, isObject, isObjectArray } from "./tests";
export { notNull, isNull } from "./notNull";
export { replacer } from "./replacer";
export { returnFormats } from "./returnFormats";
export { setConfigToCtx } from "./setConfigToCtx";
export { upload } from "./upload";
