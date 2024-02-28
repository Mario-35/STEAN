/**
 * CreateImport entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Common } from "./common";
import { formatLog } from "../../logger";
import { IcsvColumn, IcsvFile, IreturnResult } from "../../types";
import { createCsvColumnsNameImport } from "../helpers";
import { createReadStream } from 'fs';
import { addAbortSignal } from 'stream';
import { serverConfig } from "../../configuration";
import { log } from "../../log";
import { creatNameFile, ESCAPE_SIMPLE_QUOTE, _OK } from "../../constants";

export class CreateImport extends Common {
  constructor(ctx: koa.Context) {
    super(ctx);
  }

  async streamCsvFileInPostgreSqlAdmin(paramsFile: IcsvFile ): Promise<string | undefined> {
    console.log(formatLog.whereIam());
    // Create columns names
    const sqlRequest = await createCsvColumnsNameImport(paramsFile);
    
    if (sqlRequest) {
        const controller = new AbortController();
        const readable = createReadStream(paramsFile.filename);
        await serverConfig.getConnectionAdminForImport().unsafe(`CREATE TABLE "${paramsFile.tempTable}" (id serial4 NOT NULL, ${sqlRequest.columns.map((value) => `"${value}" varchar(255) NULL`)},  CONSTRAINT ${paramsFile.tempTable}_pkey PRIMARY KEY (id));`);
        await serverConfig.getConnectionAdminForImport().unsafe(`COMMENT ON TABLE "${paramsFile.tempTable}" IS '${JSON.stringify(paramsFile)}';`);
        await serverConfig.getConnectionAdminForImport().unsafe(`COMMENT ON COLUMN "${paramsFile.tempTable}".id IS '${ESCAPE_SIMPLE_QUOTE(JSON.stringify(sqlRequest))}';`);
        const writable = serverConfig.getConnectionAdminForImport().unsafe(`COPY ${paramsFile.tempTable}  (${sqlRequest.columns.map((value) => `"${value}"`).join( "," )}) FROM STDIN WITH(FORMAT csv, DELIMITER ';'${ paramsFile.header })`).writable();
        return await new Promise<string | undefined>(async (resolve, reject) => {
            readable.pipe(addAbortSignal(controller.signal, await writable))
            .on('close', async () => {         
                resolve(`Import ${paramsFile.tempTable} ${_OK}`);
            })
            .on('error', (err) => {
                log.errorMsg('ABORTED-STREAM');
                reject(err);
            });
        });
    }
  };

  async getAll(): Promise<IreturnResult | undefined> {
      const listTempTables = await serverConfig.getConnectionAdminForImport().unsafe(`SELECT array_agg(table_name) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '${this.ctx.config.name}%';`);
      const tables = listTempTables[0]["array_agg"];
      if (tables != null)  {
          return this.createReturnResult({
            body: tables.map((e: string) => `${this.linkBase}(${e.replace(this.ctx.config.name, "")})`),
          });
      }

  }
  
  async getSingle( idInput: bigint | string ): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam(idInput));
    const count = await serverConfig.getConnectionAdminForImport().unsafe(`SELECT count(id) from "${this.ctx.config.name}${idInput}";`);    
    const datas = await serverConfig.getConnectionAdminForImport().unsafe(`SELECT * from "${this.ctx.config.name}${idInput}" LIMIT ${this.ctx.odata.limit};`);
    return this.createReturnResult({
        body: { 
            "@iot.count": count[0].count,
            "values": datas
        },
      });
  }
    
  async post( dataInput: object): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam(dataInput));
    if (this.ctx.datas) {
      const myColumns: IcsvColumn[] = [];
        return this.createReturnResult({
          body: await this.streamCsvFileInPostgreSqlAdmin( {
            tempTable: creatNameFile(this.ctx.config.name),
            filename: this.ctx.datas["file"],
            columns: myColumns,
            header: ", HEADER",
            stream: [], // only for interface
          }),
        });      
    } else {
      log.errorMsg("No Datas");
      return;
    }
  }

  async update( idInput: bigint | string, dataInput: object | undefined ): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam(idInput || dataInput));
    this.ctx.throw(400, { code: 400 });
  }

  async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
    console.log(formatLog.whereIam());
    return await serverConfig.getConnectionAdminForImport().unsafe(`DROP TABLE "${this.ctx.config.name}${idInput}"`).then(() => this.createReturnResult({ body: `Delete ${idInput} ${_OK}`, id: idInput }));
  }
}
