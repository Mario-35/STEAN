/**
 * context interface
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- context interface -----------------------------------!");

import { EnumColumnType } from "../enums";


export interface IodataContext { //odata context pass to token
    key:            string | undefined;
    entity:         string | undefined;
    target:         string | undefined;
    identifier:     string | undefined;
    identifierType: EnumColumnType | undefined;
    relation:       string | undefined;
    literal:        string | undefined;
    sign:           string | undefined;
    sql:            string | undefined;    
    in:             boolean | undefined;
}
