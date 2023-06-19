/**
 * getEntities.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _DB } from "../constants";


export const getEntities = (list: string[]) => Object.fromEntries(Object.entries(_DB).filter(([k,v]) => list.includes(k)));

