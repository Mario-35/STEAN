/**
 * DataAccessInterface interfaces.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Common } from "../entities/common";
import koa from "koa";
import { IReturnResult } from "../../types";

export interface DataAccessInterface {
    readonly myEntity: Common | undefined;
    readonly ctx: koa.Context;

    formatDataInput(dataInput: Object | undefined): Object | undefined;
    getAll(queryResult: any | undefined): Promise<IReturnResult | undefined>;
    getSingle(idInput: bigint | string, propertyName?: string, onlyValue?: boolean): Promise<IReturnResult | undefined>;
    add(): Promise<IReturnResult | undefined>;
    update(idInput: bigint | string, dataInput: Object | undefined): Promise<IReturnResult | undefined>;
    delete(idInput: bigint | string): Promise<IReturnResult | undefined>;
}
