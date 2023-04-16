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
import { Logs } from "../../logger";
import { IcsvColumn, IcsvFile, IreturnResult } from "../../types";
import { createColumnHeaderName} from "../helpers";
import copyFrom from "pg-copy-streams";
import fs from "fs";
import { messages, messagesReplace } from "../../messages/";


// import { db } from "..";
import * as entities from "../entities/index";
import { returnFormats } from "../../helpers";


interface convert {
    key: string;
    value: string;
}

export class CreateFile extends Common {
    constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
        super(ctx, knexInstance);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    testValue(inputValue: any): convert | undefined {
        if (inputValue != null && inputValue !== "" && !isNaN(Number(inputValue.toString()))) return { key: "_resultnumber", value: inputValue.toString() };
        else if (typeof inputValue == "object") return { key: "_resultnumbers", value: `{"${Object.values(inputValue).join('","')}"}` };
    }

    importCsvFileInDatastream = async (ctx: koa.Context, knex: Knex | Knex.Transaction, paramsFile: IcsvFile): Promise<IreturnResult | undefined> => {
        Logs.head("importCsvFileInDatastream");
        let returnValue: IreturnResult | undefined = undefined;

        const headers = await createColumnHeaderName(paramsFile.filename);
        Logs.debug("importCsvFileInDatastream");
        
        if (headers) {
            const createDataStream = async () => {
                const nameOfFile = paramsFile.filename.split("/").reverse()[0];
                const copyCtx = Object.assign({}, ctx._odata);
                const tempId= ctx._odata.id.toString();
                ctx._odata.entity = _DBDATAS.Datastreams.name;

                // IMPORTANT TO ADD instead update
                ctx._odata.id = "";
                ctx._odata.resultFormat = returnFormats.json;
                ctx._addToLog = false;      

                const objectDatastream = new entities[_DBDATAS.Datastreams.name](ctx, Common.dbContext);
                const myDatas = {
                    "name": `${_DBDATAS.Datastreams.name} import file ${nameOfFile}`,
                    "description": "Description in meta ?",
                    "observationType": "http://www.opengis.net/def/observation-type/ogc-omxml/2.0/swe-array-observation",
                    "Thing": { "@iot.id": tempId },
                    "unitOfMeasurement": {
                        "name": headers.join(),
                        "symbol": "csv",
                        "definition": "https://www.rfc-editor.org/rfc/pdfrfc/rfc4180.txt.pdf"
                    },
                    "ObservedProperty": {
                        "name": `is Generik ${nameOfFile}`,
                        "description": "KOIKE observe",
                        "definition": "http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html#AreaTemperature"
                    },
                    "Sensor": {
                        "name": `Nom du Kapteur${nameOfFile}`,
                        "description": "Capte heures a la seconde",
                        "encodingType": "application/pdf",
                        "metadata": "https://time.com/datasheets/capteHour.pdf"
                    }
                };
                try {
                    const temp = await objectDatastream.add(myDatas);
                    return temp;
                } catch (error) {
                    ctx._odata.where = `"name" ~* '${nameOfFile}'`;
                    const returnValueError = await objectDatastream.getAll(); 
                    ctx._odata = copyCtx;
                    if (returnValueError) {
                        returnValueError.body = returnValueError.body ? returnValueError.body[0] : {};
                        if (returnValueError.body)
                            await Common.dbContext.raw(`DELETE FROM "${_DBDATAS.Observations.table}" WHERE "datastream_id" = ${returnValueError.body["@iot.id"]}`);
                        return returnValueError;
                    }
                } finally {
                    ctx._odata = copyCtx;
                }

            };

            returnValue = await createDataStream();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await knex.schema.createTable(paramsFile.tempTable, (table: any) => {
                                table.increments("id").unsigned().notNullable().primary();
                                headers.forEach((value) => table.string(value));
                            })
                            .catch((err: Error) => ctx.throw(400, { detail: err.message }));


            Logs.debug("Create Table", paramsFile.tempTable);
    
            await new Promise<Knex.Transaction>((resolve, reject) => {
                knex.transaction(async (tx: Knex.Transaction) => {
                    const cleanup = (valid: boolean, err?: Error) => {
                        if (valid == true) tx.commit;
                        else tx.rollback;
                        if (err) reject(err);
                        resolve(tx);
                    };
    
                    const client = await tx.client.acquireConnection().catch((err: Error) => reject(err));
    
                    const stream = client
                        // .query( copyFrom.from( `COPY ${paramsFile.tempTable} FROM STDIN WITH (FORMAT csv)`))
                        .query( copyFrom.from( `COPY ${paramsFile.tempTable} (${headers.join(",")}) FROM STDIN WITH (FORMAT csv, DELIMITER ';'${paramsFile.header})`))
                        

                        .on("error", (err: Error) => {
                            Logs.error(messages.errors.stream, err);
                            reject(err);
                        });
                    
                    const fileStream = fs.createReadStream(paramsFile.filename);
                    fileStream.on("error", (err: Error) => {
                        Logs.error(messages.errors.fileStream, err);
                        cleanup(false, err);
                    });
    
                    fileStream.on("end", async (tx: Knex.Transaction) => {
                        Logs.debug("COPY TO ", paramsFile.tempTable);
                        if (returnValue && returnValue.body && returnValue.body["@iot.id"]) {
                            await client.query(`INSERT INTO "${_DBDATAS.Observations.table}" ("datastream_id", "phenomenonTime", "resultTime", "_resultjson") SELECT '${String(returnValue.body["@iot.id"])}', '2021-09-17T14:56:36+02:00', '2021-09-17T14:56:36+02:00', ROW_TO_JSON(p) FROM (SELECT * FROM ${paramsFile.tempTable}) as p`); 
                            cleanup(true);
                            return returnValue;
                        }
                    });
                    fileStream.pipe(stream);
                }).catch((err: Error) => reject(err));
            });
        } else {
            ctx.throw(400, {
                code: 400, 
                detail: messages.errors.noHeaderCsv + paramsFile.filename
            });
        }
        return returnValue;        
    };

    async add(dataInput: object): Promise<IreturnResult | undefined> {
        Logs.head(messagesReplace(messages.infos.classConstructor, [this.constructor.name, `add`]));        
        if (this.ctx._datas) {
            const extras = this.ctx._datas;
            const myColumns: IcsvColumn[] = [];
            const paramsFile: IcsvFile = {
                tempTable: `temp${Date.now().toString()}`,
                filename: extras["file"],
                columns: myColumns,
                header:  ", HEADER" ,
                dataStreamId: BigInt("0"), // only for interface
                duplicates: true
            };
            const temp = await this.importCsvFileInDatastream(this.ctx, Common.dbContext, paramsFile);
            return this.createReturnResult({
                body: temp?.body
            });
        } else {
            console.log("fini else");
            return;       
        }
    }
}

