/**
 * createDbList.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _DBDATAS } from "../constants";


export const createDbList = (list: string[]) => Object.fromEntries(Object.entries(_DBDATAS).filter(([k,v]) => list.includes(k)));
