/**
 * upload.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 *
 */
// console.log("!----------------------------------- upload. -----------------------------------!");
import Busboy from "busboy";
import path from "path";
import util from "util";
import fs from "fs";
import { log } from "../log";
import { koaContext } from "../types";

/**
 *
 * @param ctx Koa context
 * @returns KeyString
 */
// console.log("!----------------------------------- upload. -----------------------------------!");
export const upload = (ctx: koaContext): Promise<object> => {
  // Init results
  const data:object = {};
  // Create promise
  return new Promise(async (resolve, reject) => {
    const uploadPath = "./upload";
    const allowedExtName = ["csv", "txt", "json"];
    // Init path
    if (!fs.existsSync(uploadPath)) {
      const mkdir = util.promisify(fs.mkdir);
      await mkdir(uploadPath).catch((error) => {
        // @ts-ignore
        data["state"] = "ERROR";
        reject(error);
      });
    }
    // Create Busboy object
    const busboy = new Busboy({ headers: ctx.req.headers });
    // Stream
    busboy.on("file", (fieldname, file, filename) => {
      const extname = path.extname(filename).substring(1);
      if (!allowedExtName.includes(extname)) {
        // @ts-ignore
        data["state"] = "UPLOAD UNALLOWED FILE";
        file.resume();
        reject(data);
      } else {
        file.pipe(fs.createWriteStream(uploadPath + "/" + filename));
        // @ts-ignore
        data["file"] = uploadPath + "/" + filename;
        file.on("data", (chunk) => {
          // @ts-ignore
          data["state"] = `GET ${chunk.length} bytes`;
        });

        file.on("error", (error: Error) => {
          log.errorMsg(error);
        });

        file.on("end", () => {
        // @ts-ignore
          data["state"] = "UPLOAD FINISHED";
        // @ts-ignore
          data[fieldname] = uploadPath + "/" + filename;
        });
      }
    });

    busboy.on("field", (fieldname, value) => {
      // @ts-ignore
      data[fieldname] = value;
    });
    // catch error
    busboy.on("error", (error: Error) => {
      log.errorMsg(error);
      // @ts-ignore
      data["state"] = "ERROR";
      reject(error);
    });
    // finish
    busboy.on("finish", () => {
      // @ts-ignore
      data["state"] = "DONE";
      resolve(data);
    });
    // run it
    ctx.req.pipe(busboy);
  });
};
