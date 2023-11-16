/**
 * tests Is.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { getEntityName } from ".";
import { _DB } from "../db/constants";
import { PgVisitor } from "../odata";
import { Ientity } from "../types";
import { returnFormats } from "./returnFormats";

export const isTest = () => process.env.NODE_ENV?.trim() === "test" || false;
export const isProduction = () => process.env.NODE_ENV?.trim() === "production" || false;
export const isDev = () => process.env.NODE_ENV?.trim() === "development" || false;
export const isCsvOrArray = (input: PgVisitor) => [returnFormats.dataArray, returnFormats.csv].includes(input.resultFormat) ? true : undefined;
export const isGraph = (input: PgVisitor) => [returnFormats.graph, returnFormats.graphDatas].includes(input.resultFormat) ? true : undefined;
export const isObservation = (input: Ientity | string) => typeof input === "string" ? input === _DB.Observations.name : input.name === _DB.Observations.name;
export const isSingular = (input: string): boolean => { const entityName = getEntityName(input); return entityName ? _DB[entityName].singular == input : false; };
