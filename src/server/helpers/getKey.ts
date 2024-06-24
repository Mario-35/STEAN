/**
 * getKey
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- getKey -----------------------------------!");

import fs from "fs";
import path from "path";

export const getKey = () => {
  const _APP_KEY = "zLwX893Mtt9Rc0TKvlInDXuZTFj9rxDV";
  try {
    return fs.readFileSync(path.resolve(__dirname, "../configuration/.key"), "utf8");
  } catch (error) {
    fs.writeFileSync(path.resolve(__dirname, "../configuration/.key"), _APP_KEY, { encoding: "utf-8" });
    return _APP_KEY
  }
};