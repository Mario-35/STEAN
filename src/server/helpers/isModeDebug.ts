/**
 * returnBody.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const isModeDebug = (): boolean => process.env.DEBUG?.trim() === "true" || false;
