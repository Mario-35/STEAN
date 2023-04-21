/**
 * csvFile interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IcsvColumn } from ".";

export interface IcsvFile {
    filename: string;
    tempTable: string;
    dataStreamId: bigint;
    columns: IcsvColumn[];
    header: string;
}
