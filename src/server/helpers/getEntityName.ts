/**
 * getEntityName.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { _DB } from "../db/constants";

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
    ? _DB.hasOwnProperty(testString)
      ? testString
      : Object.keys(_DB).filter(
          (elem: string) =>
            _DB[elem].table == testString.toLowerCase() ||
            _DB[elem].singular == testString
        )[0]
    : undefined;
}
