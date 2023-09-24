/**
 * Decoders entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { IreturnResult } from "../../types";
import { Common } from "./common";
import { Logs } from "../../logger";
import { errors } from "../../messages";
import { asyncForEach } from "../../helpers";

export class Decoders extends Common {
    constructor(ctx: koa.Context) {
         super(ctx);
    }

    async decodeLoraPayload(decoder: string | bigint, payload: string): Promise<any> {
        Logs.debug(`decodeLoraPayload deveui : [${decoder}]`, payload);
        return await Common.dbContext(this.DBST.Decoders.table).select("code", "nomenclature", "synonym", "dataKeys").whereRaw(`id = ${decoder}`).first().then((res: any) => {
            if (res) {     
                try {                       
                    const F = new Function("input", "nomenclature", `${String(res.code)}; return decode(input, nomenclature);`);
                    return F(payload, JSON.parse(res.nomenclature));
                } catch (error) { 
                    console.log(error);    
                    return {"error" : error};          
                }
            }            
            return {"error" : errors.DecodingPayloadError};            
        });
    }

    async getAll(): Promise<IreturnResult | undefined> {
        Logs.whereIam();
        if (this.ctx._odata.payload) {
            const result = {};
            const ids = await Common.dbContext(this.DBST.Decoders.table).select("id", "name");
            await asyncForEach(
                // Start connectionsening ALL entries in config file        
                    Object(ids),
                    async (id: string) => {  
                        if (this.ctx._odata.payload) { 
                            const temp = await this.decodeLoraPayload(id["id"], this.ctx._odata.payload);
                            temp["Decoder id"] = id["id"];                         
                            result[id["name"]] = temp;
                        }          
                    }
            );
            return this.createReturnResult({ body: result});
        } else return await super.getAll();
    }

    async getSingle(idInput: bigint | string): Promise<IreturnResult | undefined> {
        Logs.whereIam();
        return (this.ctx._odata.payload) 
            ? this.createReturnResult({ body: await this.decodeLoraPayload(this.ctx._odata.id, this.ctx._odata.payload) })
            : await super.getSingle(idInput);
    }
}
