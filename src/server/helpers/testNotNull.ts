/**
 * testNotNull.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const isNull = (input: any): boolean => {
    switch (typeof input) {
        case "string":
            if(input && input != "" && input != null) return true;
        case "object":
            if(input && Object.keys(input).length > 0) return true;    
        default:
            return false;
    } 
};
