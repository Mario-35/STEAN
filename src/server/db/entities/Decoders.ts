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
import { formatLog } from "../../logger";
import { addDoubleQuotes, asyncForEach } from "../../helpers";
import { decodingPayload } from "../../lora";
import { executeSql, executeSqlValues } from "../helpers";
export class Decoders extends Common {
  constructor(ctx: koa.Context) {
    super(ctx);
  }

  async getAll(): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (this.ctx.odata.payload) {
      const result = {};
      const decoders = await executeSql(this.ctx.config, `SELECT "id", "name", "code", "nomenclature", "synonym" FROM ${addDoubleQuotes(this.ctx.model.Decoders.table)}`);
      await asyncForEach(
        // Start connectionsening ALL entries in config file
        Object(decoders),
        async (decoder: object) => {          
          if (this.ctx.odata.payload) {
            const temp = decodingPayload( { name: decoder["name"], code: String(decoder["code"]), nomenclature: decoder["nomenclature"], },
              this.ctx.odata.payload
            );
            result[decoder["id"]] = temp;
          }
        }
      );
      return this.createReturnResult({ body: result });
    } else return await super.getAll();
  }

  async getSingle( idInput: bigint | string ): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (this.ctx.odata.payload) {
      const decoder = await executeSqlValues(this.ctx.config, `SELECT "id", "name", "code", "nomenclature", "synonym" FROM "${this.ctx.model.Decoders.table}" WHERE id = this.ctx.odata.id`);
      return decoder[0]
        ? this.createReturnResult({
            body: decodingPayload( { name: decoder[0]["name"], 
            code: String(decoder[0]["code"]), 
            nomenclature: decoder[0]["nomenclature"], },
            this.ctx.odata.payload
            ),
          })
        : undefined;
    } else return await super.getSingle(idInput);
  }
}
