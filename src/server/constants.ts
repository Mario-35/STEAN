/**
 * Constants of API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
"use strict";

export const _OK = "✔️️";
export const _NOTOK = "❌";
export const _FORBIDDEN = "⛔️";
export const _TOOLS = "🛠️";
export const _SEARCH = "🔎";
export const _LOCK= "🔏";
export const _UNLOCK= "🔐";
export const _KEY= "🔑";
export const _WEB= "🌍";
export const _WAIT= "⏳";
export const _TIME= "⏲️";
export const _DEL= "🗑️";
export const _NOTIMPLEMENTED = "🚧";

import fs from "fs";
export const TEST = "test";
export const DEFAULT_DB = "postgres";
export const ADMIN = "admin";
export const APP_NAME = process.env.npm_package_name || "_STEAN";
export const APP_VERSION = process.env.npm_package_version || "0";
export const APP_KEY = fs.readFileSync(__dirname + "/configuration/.key", "utf8") || "zLwX893Mtt9Rc0TKvlInDXuZTFj9rxDV";
export let _DEBUG = true;
export let _READY = false;
export const VOIDTABLE = "spatial_ref_sys";
export const DOUBLEQUOTE = '"';
export const QUOTEDCOMA = '",\n"';
export const API_VERSION = "v1.0";
export const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : "production";
export const TIMESTAMP = (): string => { const d = new Date(); return d.toLocaleTimeString(); };
export function setDebug(input: boolean) { _DEBUG = input; }
export function setReady(input: boolean) { _READY = input; }
export const HELMET_CONFIG = Object.freeze({
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    "cdnjs.cloudflare.com",
    "fonts.googleapis.com",
  ],
});