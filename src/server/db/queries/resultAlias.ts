/**
 * resultAlias.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const resultAlias = (keys: boolean) => keys === true ? `coalesce("result"-> 'valueskeys', "result"-> 'value') AS result` : `"result"-> 'value' AS result`;


