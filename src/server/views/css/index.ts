/**
 * Index Css.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import fs from "fs";
import path from "path";
  export const addCssFile = (name: string):string => (fs.existsSync(__dirname + `/${name}`)) ? fs.readFileSync(__dirname + `/${name}`, "utf-8") : fs.readFileSync(__dirname + `/${name.replace(".css",".min.css")}`, "utf-8");
  
  export const listaddCssFiles = ():string[] => {
    const result: string[] = [];
    fs.readdirSync(path.join(__dirname)).filter((e: string) => e.endsWith(".css")).forEach(file => {
        result.push(file);
      });      
    return result;
  };