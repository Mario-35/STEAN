/**
 * decode Tool
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 * NOT Use in API use to decode in command line
 *
 */
// onsole.log("!----------------------------------- decode Tool -----------------------------------!");

import fs from "fs";
import crypto from "crypto";
import { isString } from "../helpers/tests";
import { APP_KEY } from "../constants";

const decrypt = (input: string, key: string): string => {
  input = input.split("\r\n").join("");     
  if (isString("string") && input[32] == ".") {      
    try {
      const decipher = crypto.createDecipheriv( "aes-256-ctr", key, Buffer.from(input.substring(32, 0), "hex") );
      const decrpyted = Buffer.concat([ decipher.update(Buffer.from(input.slice(33), "hex")), decipher.final(), ]);
      return decrpyted.toString();
    } catch (error) {
      console.log(error);
    }
  }
  return input;
};

function decode(file: fs.PathOrFileDescriptor) {
  const fileTemp = fs.readFileSync(file, "utf8");  
  return decrypt(fileTemp, APP_KEY); 
}

process.stdout.write(decode(__dirname + `/configuration.json`) + "\n");