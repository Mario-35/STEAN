/**
 * entityColumn interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IKeyString, IKeyBoolean, IconfigFile } from ".";
import { EnumExtensions } from "../enums";

export interface IentityColumn {
    [key: string]: {
        readonly create: string;
        extensions?: EnumExtensions;
        alias(config: IconfigFile, test?: IKeyBoolean): string | undefined | void;
        readonly unique?: boolean;
        readonly test?: string;
        readonly dataList?: IKeyString;
        readonly type: string;
        readonly verify?: {
            list: string[];
            default: string;
        }
    };
}