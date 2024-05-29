/**
 * bigIntReplacer.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
 */
// onsole.log("!----------------------------------- bigIntReplacer. -----------------------------------!");
// replace bigInt in string to valdate JSON
export const bigIntReplacer = <K,V>(key: K, value: V) => typeof value === "bigint" ? value.toString() : value;
