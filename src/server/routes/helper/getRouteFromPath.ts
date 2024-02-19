/**
 * getRouteFromPath.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const getRouteFromPath = (input: string): string => {
  const result = input.trim() != "/" ? input .split("/").reverse().filter((word) => word.trim() != "")[0].toUpperCase() : "";
  return result.includes("(") ? result.split("(")[0] : result;
};