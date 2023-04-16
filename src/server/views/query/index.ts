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

export const queryHtmlPage = (params: Iquery): string => {
    Logs.head("queryHtmlPage");
    return commonHtml(fs.readFileSync(__dirname + "/query.html").toString(), params);
};
