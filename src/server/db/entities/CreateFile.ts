/**
 * CreateFile entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Common } from "./common";
import { Logs } from "../../logger";
import { IcsvColumn, IcsvFile, IreturnResult } from "../../types";
import { createColumnHeaderName, executeSql } from "../helpers";
import { errors, infos, msg } from "../../messages/";
import * as entities from "../entities/index";
import { returnFormats } from "../../helpers";
import { createReadStream } from 'fs';
import { addAbortSignal } from 'stream';
import { serverConfig } from "../../configuration";
// const { finished } = require('node:stream/promises');

export class CreateFile extends Common {
  constructor(ctx: koa.Context) {
    super(ctx);
  }

  streamCsvFileInPostgreSqlFileInDatastream = async ( ctx: koa.Context, paramsFile: IcsvFile ): Promise<string | undefined> => {
    Logs.head("streamCsvFileInPostgreSqlFileInDatastream");
    const headers = await createColumnHeaderName(paramsFile.filename);

    if (!headers) {
      ctx.throw(400, {
        code: 400,
        detail: errors.noHeaderCsv + paramsFile.filename,
      });
    }
    const createDataStream = async () => {
      const nameOfFile = paramsFile.filename.split("/").reverse()[0];
      const copyCtx = Object.assign({}, ctx._odata);
      const tempId = ctx._odata.id.toString();
      ctx._odata.entity = this.DBST.Datastreams.name;

      // IMPORTANT TO ADD instead update
      ctx._odata.id = "";
      ctx._odata.resultFormat = returnFormats.json;
      ctx._log = undefined;

      const objectDatastream = new entities[this.DBST.Datastreams.name](
        ctx
      );
      const myDatas = {
        name: `${this.DBST.Datastreams.name} import file ${nameOfFile}`,
        description: "Description in meta ?",
        observationType:
          "http://www.opengis.net/def/observation-type/ogc-omxml/2.0/swe-array-observation",
        Thing: { "@iot.id": tempId },
        unitOfMeasurement: {
          name: headers.join(),
          symbol: "csv",
          definition: "https://www.rfc-editor.org/rfc/pdfrfc/rfc4180.txt.pdf",
        },
        ObservedProperty: {
          name: `is Generik ${nameOfFile}`,
          description: "KOIKE observe",
          definition:
            "http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html#AreaTemperature",
        },
        Sensor: {
          name: `Nom du Kapteur${nameOfFile}`,
          description: "Capte heures a la seconde",
          encodingType: "application/pdf",
          metadata: "https://time.com/datasheets/capteHour.pdf",
        },
      };
      try {
        return await objectDatastream.add(myDatas);
      } catch (error) {
        ctx._odata.where = `"name" ~* '${nameOfFile}'`;
        const returnValueError = await objectDatastream.getAll();
        ctx._odata = copyCtx;
        if (returnValueError) {
          returnValueError.body = returnValueError.body
            ? returnValueError.body[0]
            : {};
          if (returnValueError.body)
            await executeSql(ctx._config.name, `DELETE FROM "${this.DBST.Observations.table}" WHERE "datastream_id" = ${returnValueError.body["@iot.id"]}`, true);
          return returnValueError;
        }
      } finally {
        ctx._odata = copyCtx;
      }
    };

    const returnValue = await createDataStream();
    
      const controller = new AbortController();
      const readable = createReadStream(paramsFile.filename);
      const cols:string[] = [];
      headers.forEach((value) => cols.push(`"${value}" varchar(255) NULL`));
  
      const createTable = `CREATE TABLE public."${paramsFile.tempTable}" (
        id serial4 NOT NULL,
        "date" varchar(255) NULL,
        "hour" varchar(255) NULL,
        ${cols}, 
        CONSTRAINT ${paramsFile.tempTable}_pkey PRIMARY KEY (id));`;
        await executeSql(ctx._config.name, createTable, true);
      const writable = serverConfig.db(ctx._config.name).unsafe(`COPY ${paramsFile.tempTable}  (${headers.join( "," )}) FROM STDIN WITH(FORMAT csv, DELIMITER ';'${ paramsFile.header })`).writable();
      return await new Promise<string | undefined>(async (resolve, reject) => {
      
      readable
        .pipe(addAbortSignal(controller.signal, await writable))
        .on('close', async () => {
          const sql = `INSERT INTO "${ this.DBST.Observations.table }" 
                    ("datastream_id", "phenomenonTime", "resultTime", "result") 
                    SELECT '${String(
                      returnValue.body["@iot.id"]
                    )}', '2021-09-17T14:56:36+02:00', '2021-09-17T14:56:36+02:00', json_build_object('value',ROW_TO_JSON(p)) FROM (SELECT * FROM ${
                      paramsFile.tempTable
                    }) AS p`;
          await serverConfig.db(this.ctx._config.name).unsafe(sql);          
          resolve(returnValue["body"]);
        })
        .on('error', (err) => {
          Logs.error('ABORTED-STREAM');
          reject(err);
        });
        
      // await finished(stream);
      });
  };

  async add(dataInput: object): Promise<IreturnResult | undefined> {
    Logs.head(msg(infos.classConstructor, this.constructor.name, `add`));
    if (this.ctx._datas) {
      const myColumns: IcsvColumn[] = [];
        return this.createReturnResult({
          body: await this.streamCsvFileInPostgreSqlFileInDatastream( this.ctx, {
            tempTable: `temp${Date.now().toString()}`,
            filename: this.ctx._datas["file"],
            columns: myColumns,
            header: ", HEADER",
            stream: [], // only for interface
          }),
        });      
    } else {
      Logs.error("No Datas");
      return;
    }
  }
}
