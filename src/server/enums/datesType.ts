/**
 * datesType Enum
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- datesType Enum -----------------------------------!");
export enum EnumDatesType {    
    date = 'YYYY-MM-DD"T"HH24:MI:SSZ',
    dateWithTimeZone = 'YYYY-MM-DD HH:MI:SSTZH:TZM',
    dateWithOutTimeZone = 'YYYY-MM-DDXHH24:MI:SS'
}
