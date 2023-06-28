/**
 * Constants of API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
"use strict";

import fs from "fs";
export let _ready = false;
export const TEST = "test";
export const ADMIN = "admin";
export const APP_NAME = process.env.npm_package_name || '_STEAN';
export const APP_VERSION = process.env.npm_package_version || '0';
export const APP_KEY = fs.readFileSync(__dirname + "/configuration/.key", "utf8") || "zLwX893Mtt9Rc0TKvlInDXuZTFj9rxDV";
export let _debug = true;
export const VOIDTABLE = "spatial_ref_sys";
export const DOUBLEQUOTE = '"';
export const QUOTEDCOMA = '",\n"';
export const API_VERSION = "v1.0";
export const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : "production";
export const booleanToString = (input: boolean):string => input === true ? "TRUE" : "FALSE"; 
export const TIMESTAMP = (): string => { const d = new Date(); return d.toLocaleTimeString(); };
export const HELMET_CONFIG = Object.freeze({
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"]
});

export function setDebug(input: boolean) {
    _debug = input;
}

export function setReady(input: boolean) {
    _ready = input;
}
