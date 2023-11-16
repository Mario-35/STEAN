/**
 * Utils.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";


export const removeQuotes = (input: string): string => input.replace(/['"]+/g, "");
export const getUserId = (ctx: koa.Context): number => ctx.state.user && ctx.state.user.id ? ctx.state.user.id : -1;
export const unikeList = (input: string[]) => [...new Set(input)];

export { asyncForEach } from "./asyncForEach";
export { encrypt, decrypt } from "./crypto";
export { cleanUrl } from "./cleanUrl";
export { cleanStringComma } from "./cleanStringComma";
export { getBigIntFromString } from "./getBigIntFromString";
export { getEntityName } from "./getEntityName";
export { hidePasswordIn, hidePasswordInJSON } from "./hidePasswordIn";
export { hideKeysInJson } from "./hideKeysInJson";
export { getUrlId } from "./getUrlId";
export { getUrlKey } from "./getUrlKey";
export { setConfigToCtx } from "./setConfigToCtx";
export { replacer } from "./replacer";
export { createBearerToken } from "./createBearerToken";
export { configCtx } from "./showconfigCtx";
export { returnFormats } from "./returnFormats";
export { upload } from "./upload";
export { notNull, isNull } from "./notNull";
export { isTest, isProduction, isDev, isCsvOrArray, isGraph, isObservation, isSingular } from "./tests";
