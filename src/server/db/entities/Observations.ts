/**
 * Observations entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Common } from "./common";
import { executeSqlValues, getDBDateNow } from "../helpers";
import { formatLog } from "../../logger";
import { IreturnResult } from "../../types";
import { getBigIntFromString } from "../../helpers";
import { errors, msg } from "../../messages";
import { queryMultiDatastreamsUnitsKeys } from "../queries";
import { EextensionsType } from "../../enums";

export class Observations extends Common {
  constructor(ctx: koa.Context) {
    super(ctx);
  }

  async prepareInputResult(dataInput: object): Promise<object> {
    console.log(formatLog.whereIam());
    // IF MultiDatastream
    if ( (dataInput["MultiDatastream"] && dataInput["MultiDatastream"] != null) || (this.ctx._odata.parentEntity && this.ctx._odata.parentEntity.startsWith("MultiDatastream")) ) {
      // get search ID
      const searchID: bigint | undefined =
        dataInput["MultiDatastream"] && dataInput["MultiDatastream"] != null
          ? BigInt(dataInput["MultiDatastream"]["@iot.id"])
          : getBigIntFromString(this.ctx._odata.parentId);

      if (!searchID) this.ctx.throw(404, { code: 404, detail: msg(errors.noFound, "MultiDatastreams"), });
      // Search uint keys
      const tempSql = await executeSqlValues(this.ctx._config, queryMultiDatastreamsUnitsKeys(searchID) );      
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
    } else if (dataInput["result"] && typeof dataInput["result"] != "object")
      dataInput["result"] = this.ctx._config.extensions.includes( EextensionsType.numeric )
                            ? dataInput["result"]
                            : { value: dataInput["result"] };
    return dataInput;
  }

  async post(dataInput: object): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (dataInput) dataInput = await this.prepareInputResult(dataInput);
    return await super.post(dataInput);
  }

  async update( idInput: bigint, dataInput: object | undefined ): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    if (dataInput) dataInput = await this.prepareInputResult(dataInput);
    if (dataInput) dataInput["validTime"] = await getDBDateNow(this.ctx._config);
    return await super.update(idInput, dataInput);
  }
}
