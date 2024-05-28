/**
 * stringToBoolean.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- stringToBoolean. -----------------------------------!");
export function stringToBoolean (input: string | undefined, def?: boolean)  {
    def = def || false
    switch (typeof input) {
      case "boolean":
        return input;
      case "string":
        return input.toUpperCase() == "TRUE" ? true : def;  
      default:
        return def;
    }
  }