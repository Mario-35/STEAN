/**
 * Logs entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

 import { Knex } from "knex";
 import koa from "koa";
 import { Common } from "./common";
 import { _DBADMIN, _DBDATAS } from "../constants";
import { _CONFIGURATION } from "../../configuration";
import { message } from "../../logger";
import { IReturnResult } from "../../types";
 
 export class Logs extends Common {
     constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {         
         super(ctx, knexInstance);
         Common.dbContext =  _CONFIGURATION.getConnection("admin");    
     }

     async update(idInput: bigint | string, dataInput: Object | undefined): Promise<IReturnResult | undefined> {
        message(true, "OVERRIDE", this.constructor.name, "update");
        const temp = await Common.dbContext.raw(`select * FROM "${_DBADMIN.Logs.table}" WHERE id = ${idInput} LIMIT 1`)

        console.log(temp.rows[0]);
        const newUrl = temp.rows[0].url.replace("test","mario");
        this.ctx.body = temp.rows[0].datas;
        this.ctx.method = temp.rows[0].method;

        this.ctx.redirect(
            newUrl
        );

        console.log("=============================> Here");
        

        // return Common.dbContext
        //     .raw(sql)
        //     .then((res: any) => {                
        //         if (res.rows) {
        //             if (res.rows[0].results[0]) this.formatResult(res.rows[0].results[0]);
        //             return this.createReturnResult({
        //                 body: res.rows[0].results[0],
        //                 query: sql
        //             });
        //         }
        //     })
        //     .catch((err: any) => {
        //         this.ctx.throw(400, { detail: err.detail });
        //     });
        return undefined;
    }

 }
 