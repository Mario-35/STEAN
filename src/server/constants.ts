/**
 * Constants of API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import fs from "fs";

export const APP_NAME = process.env.npm_package_name || '_STEAN';
export const APP_VERSION = process.env.npm_package_version || '0';
export const APP_KEY = fs.readFileSync(__dirname + "/configuration/.key", "utf8") || "zLwX893Mtt9Rc0TKvlInDXuZTFj9rxDV";
export let _debug = true;
export const _VOIDTABLE = "spatial_ref_sys";
export const _DOUBLEQUOTE = '"';
export const _QUOTEDCOMA = '",\n"';
export const API_VERSION = "v1.0";
export const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : "production";
export const TIMESTAMP = (): string => {
    const d = new Date();
    return d.toLocaleTimeString();
};
export const HELMET_CONFIG = Object.freeze({
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"]
});

export function setDebug(input: boolean) {
    _debug = input;
}
