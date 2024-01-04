/**
 * Comon interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IreturnResult } from "./returnResult";

export interface Icomon {
    formatDataInput(input: object | undefined): object | undefined 
    getAll(): Promise<IreturnResult | undefined> 
    getSingle( idInput: bigint | string ): Promise<IreturnResult | undefined>
    post(): Promise<IreturnResult | undefined>
    update(idInput: bigint | string): Promise<IreturnResult | undefined>
    delete(idInput: bigint | string): Promise<IreturnResult | undefined> 
  }