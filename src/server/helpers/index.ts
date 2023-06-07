/**
 * Utils.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";

export const goodNameForPostgres = (input: string): string => input.replace(/[ ]+/g, "").toLowerCase();
export const removeQuotes = (input: string): string => input.replace(/['"]+/g, "");
export const isTest = () => process.env.NODE_ENV?.trim() === "test" || false;
export const getUserId = (ctx: koa.Context): number => ctx.state.user && ctx.state.user.id ? ctx.state.user.id : -1;

export { asyncForEach } from "./asyncForEach";
export { encrypt, decrypt } from "./crypto";
export { cleanUrl } from "./cleanUrl";
export { cleanStringComma } from "./cleanStringComma";
export { getBigIntFromString } from "./getBigIntFromString";
export { getEntityName } from "./getEntityName";
export { hidePasswordInJson } from "./hidePasswordInJson";
export { getUrlId } from "./getUrlId";
export { getUrlKey } from "./getUrlKey";
export { setConfigToCtx } from "./setConfigToCtx";
export { configCtx } from "./showconfigCtx";
export { returnFormats } from "./returnFormats";
export { upload } from "./upload";
export { notNull, isNull } from "./notNull";
