/**
 * getEntityName.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { DBDATAS } from "../db/constants";

/**
 *
 * @param search search string
 * @returns name of the entity name or undefined if not found
 */

export function getEntityName(search: string): string | undefined {
    const testString: string | undefined = search
        .match(/[a-zA-Z_]/g)
        ?.join("")
        .trim();

    return testString
        ? DBDATAS.hasOwnProperty(testString)
            ? testString
            : Object.keys(DBDATAS).filter((elem: string) => DBDATAS[elem].table == testString.toLowerCase() || DBDATAS[elem].singular == testString)[0]
        : undefined;
}
