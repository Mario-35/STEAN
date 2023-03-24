/**
 * Utils.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";

export const goodName = (input: string): string => input.replace(/[ ]+/g, "").toLowerCase();
export const removeQuotes = (input: string): string => input.replace(/['"]+/g, "");
export const boolToString = (input: boolean | undefined): string => (input && input == true ? "true" : "false");
export const stringToBool = (input: string | undefined): boolean => (input && input.toString().toLowerCase() == "true" ? true : false);
export const isTest = () => process.env.NODE_ENV?.trim() === "test" || false;
export const getUserId = (ctx: koa.Context): number =>  ctx.state.user && ctx.state.user.id ? ctx.state.user.id : -1;

export { asyncForEach } from "./asyncForEach";
export { cleanUrl } from "./cleanUrl";
export { cleanStringComma } from "./cleanStringComma";
export { encrypt, decrypt } from "./crypto";
export { getBigIntFromString } from "./getBigIntFromString";
export { getConfigName } from "./getConfigName";
export { getEntityName } from "./getEntityName";
export { hidePasswordInJson } from "./hidePasswordInJson";
export { setConfigToCtx } from "./setConfigToCtx";
export { showConfigCtx, ConfigCtx } from "./showConfigCtx";
export { returnFormats } from "./returnFormats";
export { upload } from "./upload";
export { notNull, isNull } from "./notNull";
