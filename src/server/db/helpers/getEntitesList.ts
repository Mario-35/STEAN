
/**
 * getEntitesListFromContext.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { serverConfig } from "../../configuration";
import { EextensionsType } from "../../enums";
import { _DB } from "../constants";

export const getEntitesListFromContext = (ctx: koa.Context) => Object.keys(_DB).filter((e) => ctx._config.extensions.some((r) => _DB[e].extensions.includes(r)));
export const getEntitesListFromConfig = (configName: string) => Object.keys(_DB).filter((e) => [ EextensionsType.base, EextensionsType.logger, ... serverConfig.configs[configName].extensions, ].some((r) => _DB[e].extensions.includes(r)));
