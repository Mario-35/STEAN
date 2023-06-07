/**
 * getEntityName.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export function getUrlKey(input: string, key: string): string | undefined {
    let result: string | undefined = undefined;    
    try {
        const temp = input.split("?")[1];
        const temps = temp.split("$");
        temps.forEach(e => {
            if(e.toUpperCase().startsWith(`${key.toUpperCase()}=`)) result = e.split("=")[1];
        });
    } catch (error) {        
        return result;
    }
    return result;
}
