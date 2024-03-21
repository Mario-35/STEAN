/**
 * tests Is.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import Koa from "koa";
import { ADMIN } from "../constants";
import { EuserRights } from "../enums";
import { PgVisitor } from "../odata";
import { Ientity } from "../types";
import { returnFormats } from "./returnFormats";

export const isTest = () => process.env.NODE_ENV?.trim() === "test" || false;
export const isProduction = () => process.env.NODE_ENV?.trim() === "production" || false;
export const isCsvOrArray = (input: PgVisitor) => [returnFormats.dataArray, returnFormats.csv].includes(input.resultFormat) ? true : undefined;
export const isGraph = (input: PgVisitor) => [returnFormats.graph, returnFormats.graphDatas].includes(input.resultFormat) ? true : undefined;
export const isObservation = (input: Ientity | string) => typeof input === "string" ? input === "Observations": input.name === "Observations";
export const isAdmin = (ctx: Koa.Context): boolean => ctx.config && ctx.config.name === ADMIN;
export const isAllowedTo = (ctx: Koa.Context, what: EuserRights): boolean => ctx.user && ctx.user.PDCUAS[what];
export const isObjectArray = (what: object) => Object.prototype.toString.call(what) === '[object Array]';