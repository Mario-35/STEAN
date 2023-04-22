/**
 * createDbList.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { DBDATAS } from "../constants";


export const createDbList = (list: string[]) => Object.fromEntries(Object.entries(DBDATAS).filter(([k,v]) => list.includes(k)));
