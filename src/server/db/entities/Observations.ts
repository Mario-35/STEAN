/**
 * Observations entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Common } from "./common";
import { executeSqlValues, getDBDateNow } from "../helpers";
import { formatLog } from "../../logger";
import { IreturnResult, koaContext } from "../../types";
import { getBigIntFromString } from "../../helpers";
import { errors, msg } from "../../messages";
import { multiDatastreamsUnitsKeys } from "../queries";
import { EnumExtensions } from "../../enums";

export class Observations extends Common {
  constructor(ctx: koaContext) {
    console.log(formatLog.whereIam());
    super(ctx);
  }
  // Prepare odservations 
  async prepareInputResult(dataInput: object): Promise<object> {
    console.log(formatLog.whereIam());
    // IF MultiDatastream
    if ( (dataInput["MultiDatastream"] && dataInput["MultiDatastream"] != null) || (this.ctx.odata.parentEntity && this.ctx.odata.parentEntity.startsWith("MultiDatastream")) ) {
      // get search ID
      const searchID: bigint | undefined =
        dataInput["MultiDatastream"] && dataInput["MultiDatastream"] != null
          ? BigInt(dataInput["MultiDatastream"]["@iot.id"])
          : getBigIntFromString(this.ctx.odata.parentId);

      if (!searchID) this.ctx.throw(404, { code: 404, detail: msg(errors.noFound, "MultiDatastreams"), });
      // Search uint keys
      const tempSql = await executeSqlValues(this.ctx.config, multiDatastreamsUnitsKeys(searchID) );      
      const multiDatastream = tempSql[0];
      if (dataInput["result"] && typeof dataInput["result"] == "object") {
        console.log(formatLog.debug( "result : keys", `${Object.keys(dataInput["result"]).length} : ${ multiDatastream.length }` ));
        if ( Object.keys(dataInput["result"]).length != multiDatastream.length ) {
          this.ctx.throw(400, {
            code: 400,
            detail: msg(
              errors.sizeResultUnitOfMeasurements,
              String(Object.keys(dataInput["result"]).length),
              multiDatastream.length
            ),
          });
        }
        dataInput["result"] = { value: Object.values(dataInput["result"]), valueskeys: dataInput["result"], };
      }
    } 
    else if ((dataInput["Datastream"] && dataInput["Datastream"] != null) || (this.ctx.odata.parentEntity && this.ctx.odata.parentEntity.startsWith("Datastream")) ) {     
      if (dataInput["result"] && typeof dataInput["result"] != "object")
          dataInput["result"] = this.ctx.config.extensions.includes( EnumExtensions.numeric )
                                ? dataInput["result"]
                                : { value: dataInput["result"] };
    } else if (this.ctx.request.method === "POST") {
      this.ctx.throw(404, { code: 404, detail: errors.noStream });
    }
    return dataInput;
  }

  formatDataInput(input: object | undefined): object | undefined {
    console.log(formatLog.whereIam());
    if (input) 
      if (!input["resultTime"] && input["phenomenonTime"]) input["resultTime"] = input["phenomenonTime"];
    return input;
  }

  // Override post to prepare datas before use super class
  async post(dataInput: object): Promise<IreturnResult | undefined | void> {
    console.log(formatLog.whereIam());
    if (dataInput) dataInput = await this.prepareInputResult(dataInput);
    if (dataInput["import"]) {
      
    } else return await super.post(dataInput);
  }
  // Override update to prepare datas before use super class
  async update( idInput: bigint, dataInput: object | undefined ): Promise<IreturnResult | undefined | void> {
    console.log(formatLog.whereIam());
    if (dataInput) dataInput = await this.prepareInputResult(dataInput);
    if (dataInput) dataInput["validTime"] = await getDBDateNow(this.ctx.config);
    return await super.update(idInput, dataInput);
  }
}
