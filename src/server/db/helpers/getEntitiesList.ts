/**
 * getEntitiesList.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { apiType } from "../../enums";
import { IconfigFile } from "../../types";
import { _DB } from "../constants";
import Koa from "koa";


export const getEntitiesList = (input: IconfigFile, ctx?: Koa.Context): string[] => (Object.keys(_DB)
        .filter(e => _DB[e].essai.includes(apiType.base) || (_DB[e].essai
        .includes(apiType.logged) && ctx && ctx._user.id > 0))
    );
    