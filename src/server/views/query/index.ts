/**
 * Query Index HTML / JS maker.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

/* eslint-disable quotes */

import fs from "fs";
import { _LOGS } from "../../logger";
import { IQuery } from "../constant";
import { commonHtml } from "../helpers";

export const queryHtmlPage = (params: IQuery): string => {
    _LOGS.head("queryHtmlPage");
    return commonHtml(fs.readFileSync(__dirname + "/query.html").toString(), params);
};
