/**
 * createGraph.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { logDebug, message } from "../../logger";
import { MODES } from "../../types";

// Create object compatible with Apache Echarts
// https://echarts.apache.org/examples/en/index.html
export interface IGraphDatas {
    title: string;
    keys: string[];
    ids: string[];
    values: { [key: string]: [number | null] };
    dates: string[];
}

export const createGraph = (input: JSON, mainTitle: string): IGraphDatas | undefined => {
    message(true, MODES.CLASS, "createGraph");
    if (input)
        try {
            const multi = typeof input[0]["result"] === "object" && input[0]["result"] != null;
            const keys = multi ? Object.keys(input[0]["result"]) : ["result"];
            const values: { [key: string]: [number | null] } = {};

            // create blank value to avoid undefined error
            keys.forEach((elem: string) => (values[elem] = [null]));

            const returnResult: IGraphDatas = {
                title: mainTitle,
                keys: keys,
                ids: [],
                values: values,
                dates: []
            };

            Object(input).forEach((inputElement: JSON) => {
                if (multi) {
                    keys.forEach(key => {returnResult.values[key].push(inputElement["result"] && inputElement["result"][key] ? inputElement["result"][key] : null);});
                    returnResult.ids.push(inputElement["id"]);
                    returnResult.dates.push(inputElement["date"]);
                } else {
                    returnResult.ids.push(inputElement["id"]);
                    returnResult.dates.push(inputElement["date"]);
                    returnResult.values["result"].push(inputElement["result"]);}
            });
            return returnResult;
        } catch (error) {
            logDebug(error);
            return;
        }
};
