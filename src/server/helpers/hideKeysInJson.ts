/**
 * hideKeysInJson.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

/**
 *
 * @param object string 
 * @param key or array of keys to hide
 * @returns object without keys
 */

export const hideKeysInJson = (obj: object, keys: string | string[] = ""): object => {
  if (typeof keys === "string") keys = [keys];
  for (const [k, v] of Object.entries(obj)) {
    keys.forEach((key) => {
      // @ts-ignore
      if (k.includes(key)) delete obj[k];
      // @ts-ignore
      else if (k.includes("password")) obj[k] = "*****";
      else if (typeof v === "object") hideKeysInJson(v, keys);
    });
  }
  return obj;
};
