/**
 * recordToKeyValue.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */


export const recordToKeyValue = (input: string | Object): Object => {
    const returnValue: Object = [];
    if (typeof input == "object") {
        for (const [key, value] of Object.entries(input)) returnValue[key] = value;
    }
    return returnValue;
};
