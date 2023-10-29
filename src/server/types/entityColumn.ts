/**
 * entityColumn interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IKeyString } from ".";

export interface IentityColumn {
    [key: string]: {
        readonly create: string;
        columnAlias(test?: boolean[]): string;
        readonly unique?: boolean;
        readonly test?: string;
        readonly dataList?: IKeyString;
        readonly type?: string;
        readonly verify?: {
            list: string[];
            default: string;
        }
    };
}