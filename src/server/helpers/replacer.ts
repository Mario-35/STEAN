/**
 * replacer.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
 */

export const replacer = (key: any, value: any) => typeof value === "bigint" ? value.toString() : value;
