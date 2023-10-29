/**
 * hideKeysInJson.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const hideKeysInJson = (obj: object, keys: string[]): object => {
  for (const [k, v] of Object.entries(obj)) {
    keys.forEach((key) => {
      if (k.includes(key)) delete obj[k];
      else if (k.includes("password")) obj[k] = "*****";
      else if (typeof v === "object") hideKeysInJson(v, keys);
    });
  }
  return obj;
};
