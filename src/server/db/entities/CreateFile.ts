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
import { ICsvColumns, ICsvFile, IReturnResult, MODES } from "../../types";
import { createColumnHeaderName} from "../helpers";
import { _CONFIGURATION } from "../../configuration";
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
    
    testValue(inputValue: any): convert | undefined {
        if (inputValue != null && inputValue !== "" && !isNaN(Number(inputValue.toString()))) return { key: "_resultnumber", value: inputValue.toString() };
        else if (typeof inputValue == "object") return { key: "_resultnumbers", value: `{"${Object.values(inputValue).join('","')}"}` };
    }

    importCsvFileInDatastream = async (ctx: koa.Context, knex: Knex | Knex.Transaction, paramsFile: ICsvFile): Promise<IReturnResult | undefined> => {
        message(true, MODES.HEAD, "importCsvFileInDatastream");
        let returnValue: IReturnResult | undefined = undefined;

        const headers = await createColumnHeaderName(paramsFile.filename);
        message(true, MODES.DEBUG, "importCsvFileInDatastream");
        
        if (headers) {
            const createDataStream = async () => {
                const nameOfFile = paramsFile.filename.split("/").reverse()[0];
                const copyCtx =  Object.assign({}, ctx._odata);
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
                } catch (error: any) {
                    ctx._odata.where = `"name" ~* '${nameOfFile}'`;
                    const returnValueError = await objectDatastream.getAll(); 
                    ctx._odata = copyCtx;
                    if (returnValueError) {
                        returnValueError.body = returnValueError.body ?  returnValueError.body[0] : {};
                        if (returnValueError.body)
                            await Common.dbContext.raw(`DELETE FROM "${_DBDATAS.Observations.table}" WHERE "datastream_id" = ${returnValueError.body["@iot.id"]}`)
                        return returnValueError;
                    }
                } finally  {
                    ctx._odata = copyCtx;
                }

            };

            returnValue = await createDataStream();
            await knex.schema
                .createTable(paramsFile.tempTable, (table: any) => {
                    table.text("value");
                })
                .catch((err: Error) => ctx.throw(400, { detail: err.message }));
                
            message(true, MODES.INFO, "Create Table", paramsFile.tempTable);
    
            await new Promise<void>((resolve, reject) => {
                knex.transaction(async (tx: any) => {
                    const cleanup = (valid: boolean, err?: Error) => {
                        if (valid == true) tx.commit();
                        else tx.rollback();
                        if (err) reject(err);
                        resolve();
                    };
    
                    const client = await tx.client.acquireConnection().catch((err: Error) => reject(err));
    
                    const stream = client
                        .query( copyFrom.from( `COPY ${paramsFile.tempTable} FROM STDIN WITH (FORMAT csv)`))
                        .on("error", (err: Error) => {
                            message(true, MODES.ERROR, messages.errors.stream, err);
                            reject(err);
                        });
                    
                    const fileStream = fs.createReadStream(paramsFile.filename);
                    fileStream.on("error", (err: Error) => {
                        message(true, MODES.ERROR, messages.errors.fileStream, err);
                        cleanup(false, err);
                    });
    
                    fileStream.on("end", async () => {
                        message(true, MODES.INFO, "COPY TO ", paramsFile.tempTable);
                        if (returnValue && returnValue.body && returnValue.body["@iot.id"]) {
                            const datastreamId: string = returnValue.body["@iot.id"];
                            // await Common.dbContext.raw(`DELETE FROM "${paramsFile.tempTable}" WHERE value = '${headers.join(";")}';`); 
                            const sql = `INSERT INTO "${_DBDATAS.Observations.table}" ("datastream_id", "phenomenonTime", "resultTime", "_resulttexts")
                            SELECT '${datastreamId}', '2021-09-17T14:56:36+02:00', '2021-09-17T14:56:36+02:00', string_to_array("value", ';') FROM "${paramsFile.tempTable}" WHERE value != '${headers.join(";")}'`;
                            await Common.dbContext.raw(sql); 
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

    async add(dataInput: Object): Promise<IReturnResult | undefined> {
        message(true, MODES.HEAD, messagesReplace(messages.infos.classConstructor, [this.constructor.name, `add`]));        
        if (this.ctx._datas) {
            const extras = this.ctx._datas;
            const myColumns: ICsvColumns[] = [];
            const paramsFile: ICsvFile = {
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

