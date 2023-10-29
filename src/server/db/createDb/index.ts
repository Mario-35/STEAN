/**
 * createDatabase.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IKeyString } from "../../types";
import { createAdminDB } from "./createAdminDB";
import { createSTDB } from "./createStDb";

export const createDatabase = async (
  configName: string
): Promise<IKeyString> => {
  return configName.toUpperCase() === "ADMIN"
    ? await createAdminDB()
    : await createSTDB(configName);
};
