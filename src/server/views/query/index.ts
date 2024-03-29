/**
 * Query Index HTML / JS maker.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

/* eslint-disable quotes */

import fs from "fs";
import { formatLog } from "../../logger";
import { IqueryOptions } from "../../types";
import { commonHtml } from "../helpers";

export const createQueryHtml = (params: IqueryOptions): string => {
    console.log(formatLog.head("createQueryHtml"));
    return commonHtml(fs.readFileSync(__dirname + "/query.html").toString(), params);
};
