/**
 * getColumnsListType.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { getEntityName } from "../../helpers";
import { _DBDATAS } from "../constants";

export const getColumnsListType = (tableName: string): {[key: string]: string} | undefined => {
    if (tableName.trim() == "") return;
    const name = getEntityName(tableName);
    if (!name) return;
    const returnValue: {[key: string]: string} = {};
    Object.keys(_DBDATAS[name].columns).forEach((elem: string) => {
        returnValue[elem] = _DBDATAS[name].columns[elem].type;
    });
    return returnValue;
};