/**
 * addToConfig.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import fs from "fs";
import { formatConfig, _CONFIGFILE } from ".";
import { _NODE_ENV } from "../constants";
import { hidePasswordInJson } from "../helpers";
import { IConfigFile } from "../types";

 export const addToConfig = (addJson: any): IConfigFile => {
    const tempConfig = formatConfig(addJson);
    const file = fs.readFileSync(__dirname + "/config.json", "utf8");
 
    let input = JSON.parse(file);

     if(input.hasOwnProperty(_NODE_ENV))   
      input[_NODE_ENV][tempConfig["name"]] = tempConfig;
      else input[tempConfig["name"]] = tempConfig;

     fs.writeFile(__dirname + "/config.json", JSON.stringify(input, null, 4), err => {
        if (err) {
          console.error(err);
          return false
        }
      });
      
      hidePasswordInJson(tempConfig);
     return tempConfig;
 };
 
