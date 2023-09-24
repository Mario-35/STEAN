/**
 * Query Index HTML / JS maker.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

/* eslint-disable quotes */

import fs from "fs";
import { Logs } from "../../logger";
import { Iquery } from "../../types";
import { commonHtml } from "../helpers";

export const createLoradminHtml = (params: Iquery): string => {
    Logs.head("createLoraHtml");
    return commonHtml(fs.readFileSync(__dirname + "/Loradmin.html").toString(), params);
};
