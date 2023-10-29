/**
 * hidePasswordInJson.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const hidePasswordIn = (obj: object): object | JSON => {
  if (obj !== undefined && obj !== null && obj.constructor == Object)
    return hidePasswordInOject(obj);
  else return hidePasswordInJSON(obj as JSON);
};

export const hidePasswordInJSON = (obj: JSON): JSON => {
  if (obj)
    for (const [k, v] of Object.entries(obj)) {
      if (k.includes("password")) obj[k] = "*****";
      else if (typeof v === "object") hidePasswordInJSON(v);
    }
  return obj;
};

const hidePasswordInOject = (obj: object): object => {
  for (const [k, v] of Object.entries(obj)) {
    if (k.includes("password")) obj[k] = "*****";
    else if (typeof v === "object") hidePasswordInOject(v);
  }
  return obj;
};
