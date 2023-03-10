/**
 * Index messages.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import jsonErrors from "./error.json";
import jsonInfos from "./infos.json";

export const messagesReplace =  (name: string, keys: string[]) => { keys.forEach((e: string, i: number) => { name = name.replace(`$${i+1}`, e) }); return name; };

export const messages = {
    errors : jsonErrors, 
    infos : jsonInfos 
};

