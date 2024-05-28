/**
 * csvImport interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- csvImport interface. -----------------------------------!");
export interface IcsvImport {
    header: boolean;
    dateSql: string;
    columns: string[];
  }