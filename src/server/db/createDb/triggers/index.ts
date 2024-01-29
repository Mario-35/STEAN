/**
 * Index Tripper.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import fs from "fs";
import path from "path";
import { serverConfig } from "../../../configuration";
import { EextensionsType } from "../../../enums";

export const triggers = (configName: string):string[] => {  
    const result: string[] = [];
    fs.readdirSync(path.join(__dirname)).filter((e: string) => e.endsWith(".sql")).forEach(file => {
      const content = fs.readFileSync(__dirname + `/${file}`, "utf8");
      // Remove multiDatastream if not in extension
      if (content.includes("/* START 'multiDatastream' */") && !serverConfig.getConfig(configName).extensions.includes(EextensionsType.multiDatastream)){
        const temp = content.split('"MULTIDS_ROW" "multidatastream"%rowtype;').join("").split("/* START 'multiDatastream' */");
        result.push(temp[0] + temp[1].split("/* END 'multiDatastream' */")[1]);                
      } else result.push(content);
      });    
    return result;
  };

