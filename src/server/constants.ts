/**
 * Constants of API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
"use strict";
import util from "util";
import fs from "fs";

export const _DEL= "🗑️";
export const _ERRORFILE = "errorFile.md";
export const _FORBIDDEN = "⛔️";
export const _KEY= "🔑";
export const _LOCK= "🔏";
export const _NOTIMPLEMENTED = "🚧";
export const _NOTOK = "❌";
export const _OK = "✔️️";
export const _SEARCH = "🔎";
export const _TIME= "⏲️";
export const _TOOLS = "🛠️";
export const _UNLOCK= "🔐";
export const _WAIT= "⏳";
export const _WEB= "🌍";
export const ADMIN = "admin";
export const APP_KEY = fs.readFileSync(__dirname + "/configuration/.key", "utf8") || "zLwX893Mtt9Rc0TKvlInDXuZTFj9rxDV";
export const APP_NAME = process.env.npm_package_name || "_STEAN";
export const APP_VERSION = process.env.version || process.env.npm_package_version || "0";
export const color = (col: number) => `\x1b[${col}m`;
export const DEFAULT_DB = "postgres";
export const DOUBLEQUOTEDCOMA = '",\n"';
export const _NEWLINE = '\r\n';
export const _COLUMNSEPARATOR = '@|@';
export const ESCAPE_ARRAY_JSON = (input: string) => input ? input.replace("[", "{") .replace("]", "}") : undefined;
export const ESCAPE_SIMPLE_QUOTE = (input: string) => input.replace(/[']+/g, "''");
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
export const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : "production";
export const SIMPLEQUOTEDCOMA = "',\n'";
export const TEST = "test";
export const TIMESTAMP = (): string => { const d = new Date(); return d.toLocaleTimeString(); };
export const VOIDTABLE = "spatial_ref_sys";
export function setDebug(input: boolean) { _DEBUG = input; }
export function setReady(input: boolean) { _READY = input; }
export function showAll<T>(input: T, colors?: boolean) { return typeof input === "object" ? util.inspect(input, { showHidden: false, depth: null, colors: colors || false, }) : input; }
export let _DEBUG = false;
export let _READY = false;
export function addToStrings(input: string[], data: string) { if (input) input.push(data); else input = [data]; }