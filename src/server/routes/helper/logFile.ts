/**
 * Configuration class.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- Configuration class. -----------------------------------!");
import fs from "fs";
import path from "path";
var Convert = require('ansi-to-html');

export async function loga(): Promise<string> {
 const fileContent = fs.readFileSync(path.resolve(__dirname, "../../../logs.txt"), "utf8");
 var convert = new Convert();

const zobi = convert.toHtml(fileContent);
 return zobi;
}