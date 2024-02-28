/**
 * Index Json.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import fs from "fs";
import path from "path";
  export const addJsonFile = (name: string):string => (fs.existsSync(__dirname + `/${name}`)) ? fs.readFileSync(__dirname + `/${name}`, "utf-8") : fs.readFileSync(__dirname + `/${name.replace(".json",".min.json")}`, "utf-8");
  
  export const listaddJsonFiles = ():string[] => {
    const result: string[] = [];
    fs.readdirSync(path.join(__dirname)).filter((e: string) => e.endsWith(".json")).forEach(file => {
        result.push(__dirname + "\\" +file);
      });      
    return result;
  };