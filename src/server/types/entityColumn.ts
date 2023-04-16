/**
 * entityColumn interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export interface IentityColumn {
    [key: string]: {
        readonly create: string;
        readonly alias?: string;
        readonly unique?: boolean;
        readonly test?: string;
        readonly dataList?: { [key: string]: string };
        readonly type?: string;
        readonly verify?: {
            list: string[];
            default: string;
        }
    };
}