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
import { _DBDATAS } from "../constants";
import { message } from "../../logger";
import { ICsvColumns, ICsvFile, IReturnResult } from "../../types";
import { createColumnHeaderName} from "../helpers";
import { _CONFIGURATION } from "../../configuration";
import copyFrom from "pg-copy-streams";
import fs from "fs";

// import { db } from "..";
import * as entities from "../entities/index";


interface convert {
    key: string;
    value: string;
}

export class CreateFile extends Common {
    constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
        super(ctx, knexInstance);
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    testValue(inputValue: any): convert | undefined {
        if (inputValue != null && inputValue !== "" && !isNaN(Number(inputValue.toString()))) return { key: "_resultnumber", value: inputValue.toString() };
        else if (typeof inputValue == "object") return { key: "_resultnumbers", value: `{"${Object.values(inputValue).join('","')}"}` };
    }

    importCsvFileInDatastream = async (ctx: koa.Context, knex: Knex | Knex.Transaction, paramsFile: ICsvFile): Promise<string[]> => {
        message(true, "HEAD", "importCsvFileInDatastream");
        const returnValue: string[] = [];
    
        const headers = await createColumnHeaderName(paramsFile.filename);
    
        if (headers) {
            await knex.schema
                .createTable(paramsFile.tempTable, (table: any) => {
                    // table.increments("id").unsigned().notNullable().primary();
                    table.text("value");
                })
                .catch((err: Error) => ctx.throw(400, { detail: err.message }));
            message(true, "INFO", "Create Table", paramsFile.tempTable);
    
            await new Promise<void>((resolve, reject) => {
                knex.transaction(async (tx: any) => {
                    const cleanup = (valid: boolean, err?: Error) => {
                        if (valid == true) tx.commit();
                        else tx.rollback();
                        if (err) reject(err);
                    };
    
                    const client = await tx.client.acquireConnection().catch((err: Error) => reject(err));
    
                    const stream = client
                        .query( copyFrom.from( `COPY ${paramsFile.tempTable} FROM STDIN WITH (FORMAT csv)`))
                        .on("error", (err: Error) => {
                            message(true, "ERROR", "stream error", err);
                            reject(err);
                        });
    
                    const fileStream = fs.createReadStream(paramsFile.filename);
    
                    fileStream.on("error", (err: Error) => {
                        message(true, "ERROR", "fileStream error", err);
                        cleanup(false, err);
                    });
    
                    fileStream.on("end", async () => {
                        message(true, "INFO", "COPY TO ", paramsFile.tempTable);
                        cleanup(true);
                        const objectDatastream = new entities[("Datastreams")](ctx, Common.dbContext);
                        const myDatas = {
                                    "name": "Dastastream Name",
                                    "description": "Description in meta ?",
                                    "observationType": "SWE Array Observation",
                                    "Thing": { "@iot.id": 26 },
                                    "unitOfMeasurement": {
                                        "name": headers.join(),
                                        "symbol": "csv",
                                        "definition": "https://www.rfc-editor.org/rfc/pdfrfc/rfc4180.txt.pdf"
                                    },
                                    "ObservedProperty": {
                                        "name": "is Generik ?",
                                        "description": "KOIKE observe",
                                        "definition": "http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html#AreaTemperature"
                                    },
                                    "Sensor": {
                                        "name": "Nom du Kapteur",
                                        "description": "Capte heures a la seconde",
                                        "encodingType": "application/pdf",
                                        "metadata": "https://time.com/datasheets/capteHour.pdf"
                                    }
                                };
                        const temppDatastream = await objectDatastream.add(myDatas);
                        if (temppDatastream && temppDatastream.body && temppDatastream.body["id"]) {
                            const id = temppDatastream.body["id"];
                            const sql = `INSERT INTO "${_DBDATAS.Observations.table}" ("datastream_id", "phenomenonTime", "resultTime", "_resulttexts")
                            SELECT '${id}', '2021-09-17T14:56:36+02:00', '2021-09-17T14:56:36+02:00', string_to_array("value", ';') FROM "${paramsFile.tempTable}"`;
                            const tempQuery = await Common.dbContext.raw(sql);
                            console.log(tempQuery);
                            
                        }
                        resolve();
                    });
    
                    fileStream.pipe(stream);
                }).catch((err: Error) => reject(err));
            }).catch((err: Error) => {
                ctx.throw(400, { detail: err.message });
            });
        } else {
            ctx.throw(400, {
                code: 400, 
                detail: `No Header i foudd in csv file : ${paramsFile.filename}`
            });
        }
        return returnValue;
    };

    async add(dataInput: Object): Promise<IReturnResult | undefined> {
        message(true, "HEAD", `class ${this.constructor.name} override add`);
        if (this.ctx._datas) {
            const extras = this.ctx._datas;
            const myColumns: ICsvColumns[] = [];
            const paramsFile: ICsvFile = {
                tempTable: `temp${Date.now().toString()}`,
                filename: extras["file"],
                columns: myColumns,
                header:  ", HEADER" ,
                dataStreamId: BigInt("1"),
                duplicates: true
            };
            await this.importCsvFileInDatastream(this.ctx, Common.dbContext, paramsFile);
            message(true, "INFO", "importCsv", "OK");

            
        } else {
        return;       
        }
    }
}

