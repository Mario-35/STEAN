/**
 * getUrlId.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export function getUrlId(input: string): string | undefined {
    try {
        return input.split("(")[1].split(")")[0];
    } catch (error) {        
        return undefined;
    }
}
