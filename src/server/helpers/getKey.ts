/**
 * getKey.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- getKey. -----------------------------------!");
import fs from "fs";
import path from "path";
const _APP_KEY = "zLwX893Mtt9Rc0TKvlInDXuZTFj9rxDV";

export const getKey = () => {
  try {
    return fs.readFileSync(path.resolve(__dirname, "../configuration/.key"), "utf8");
  } catch (error) {
    fs.writeFileSync(path.resolve(__dirname, "../configuration/.key"), _APP_KEY, { encoding: "utf-8" });
    return _APP_KEY
  }
};