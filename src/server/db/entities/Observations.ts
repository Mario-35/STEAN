/**
 * Observations entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";
import koa from "koa";
import { Common } from "./common";
import { getDBDateNow } from "../helpers";
import { Logs } from "../../logger";
import { IreturnResult } from "../../types";
import { getBigIntFromString } from "../../helpers";
import { messages, messagesReplace } from "../../messages";
import { QUOTEDCOMA } from "../../constants";

export class Observations extends Common {
    constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
        super(ctx, knexInstance);
    }

    async prepareInputResult(dataInput: object): Promise<object> {
        Logs.class(this.constructor.name, "prepareInputResult");     
        
        if ((dataInput["MultiDatastream"] && dataInput["MultiDatastream"] != null) || ( this.ctx._odata.parentEntity && this.ctx._odata.parentEntity.startsWith("MultiDatastream"))) {
            const search: bigint | undefined =
            dataInput["MultiDatastream"] && dataInput["MultiDatastream"] != null
            ? BigInt(dataInput["MultiDatastream"]["@iot.id"])
            : getBigIntFromString(this.ctx._odata.parentId);
            
            if (!search) this.ctx.throw(404, { code: 404, detail: messagesReplace(messages.errors.noFound, ["MultiDatastreams"]) });
            
            const tempSql = await Common.dbContext.raw(
                `select jsonb_agg(tmp.units -> 'name') as keys from ( select jsonb_array_elements("unitOfMeasurements") as units from multidatastream where id = ${search} ) as tmp`
                );
                const multiDatastream = tempSql.rows[0];
                if (dataInput["result"] && typeof dataInput["result"] == "object") {
                    Logs.debug("_resultnumbers : keys", `${Object.keys(dataInput["result"]).length} : ${multiDatastream["keys"].length}`);
                    if (Object.keys(dataInput["result"]).length != multiDatastream["keys"].length) {
                        this.ctx.throw(400, {
                            code: 400, 
                            detail: messagesReplace(messages.errors.sizeResultUnitOfMeasurements, [String(Object.keys(dataInput["result"]).length), multiDatastream["keys"].length])
                        });
                    }
                    const upperResults = {};
                    Object.keys(dataInput["result"]).forEach((element: string) => {
                        upperResults[element.toUpperCase()] = dataInput["result"][element];
                    });
                    
                    const tempNumbers: number[] = [];
                    multiDatastream["keys"].forEach((element: string) => {
                        tempNumbers.push(upperResults[element.toUpperCase()]);
                    });
                    dataInput["_resultnumbers"] = `{"${tempNumbers.join(QUOTEDCOMA)}"}`;
                delete dataInput["result"];
            }
        } else if (dataInput["result"]) {
            const inputValue = dataInput["result"];
            if (inputValue != null && inputValue !== "" && !isNaN(Number(inputValue.toString()))) dataInput["_resultnumber"] = inputValue.toString();
            else if (typeof inputValue == "object") dataInput["_resultnumbers"] = `{"${Object.values(inputValue).join(QUOTEDCOMA)}"}`;
            delete dataInput["result"];
        }        
        return dataInput;
    }
    
    async add(dataInput: object): Promise<IreturnResult | undefined> {
        Logs.head(`class ${this.constructor.name} override add`);
        if (dataInput) dataInput = await this.prepareInputResult(dataInput);
        return await super.add(dataInput);
    }
    
    async update(idInput: bigint, dataInput: object | undefined): Promise<IreturnResult | undefined> {
        Logs.head(`class ${this.constructor.name} override update`);
        if (dataInput) dataInput = await this.prepareInputResult(dataInput);
        if (dataInput) dataInput["validTime"] = await getDBDateNow(Common.dbContext);
        return await super.update(idInput, dataInput);
    }
}
