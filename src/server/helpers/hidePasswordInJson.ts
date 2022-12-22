/**
 * hidePasswordInJson.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const hidePasswordInJson = (obj: object): void => {
    for (const [k, v] of Object.entries(obj)) {
      if (k.includes("password")) {
        obj[k] = "*****";
      } else if (typeof v === "object") {
        hidePasswordInJson(v);
      }
    }
  };