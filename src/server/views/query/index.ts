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

export const createQueryHtml = (params: Iquery): string => {
    Logs.head("createQueryHtml");
    return commonHtml(fs.readFileSync(__dirname + "/query.html").toString(), params);
};
