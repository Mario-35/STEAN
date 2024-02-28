/**
 * entityColumn interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IKeyString, IKeyBoolean, IconfigFile } from ".";
import { EextensionsType } from "../enums";

export interface IentityColumn {
    [key: string]: {
        readonly create: string;
        extensions?: EextensionsType;
        columnAlias(config: IconfigFile, test?: IKeyBoolean): string | undefined;
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