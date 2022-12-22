/**
 * changeInJson.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

/**
 * id : name of the key
 * value : replace value
 * obj: object source
 */

export const changeInJson = (id: string, value: string, obj: object): void => {
    for (const [k, v] of Object.entries(obj)) {
      if (k === id) {
        obj[k] = value;
      } else if (typeof v === "object") {
        changeInJson(id, value, v);
      }
    }
  };