/**
 * Helpers for user admin.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const getRouteFromPath = (input: string): string => {
  const result: string | undefined =
    input.trim() != "/"
      ? input .split("/") .reverse() .filter((word) => word.trim() != "")[0] .toUpperCase()
      : "";      
  return result.includes("(") ? result.split("(")[0] : result;
};

export const emailIsValid = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// at least one number, one lowercase and one uppercase letter
// at least six characters that are letters, numbers or the underscore
export const checkPassword = (str: string): boolean => /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])\w{6,}$/.test(str);

