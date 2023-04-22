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
import { _OBSERVATIONTYPES, _DATEFORMATNOTIMEZONE} from "../constants";
import { Logs } from "../../logger";
import { IcsvColumn, IcsvFile, Ientity, IreturnResult } from "../../types";
import { importCsv, verifyId } from "../helpers";
import { asyncForEach } from "../../helpers";
import { messages, messagesReplace } from "../../messages/";
import { queryAsJson } from "../../helpers/returnFormats";
// import { EstreamType } from "../../enums";

export class CreateObservations extends Common {
    constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
        super(ctx, knexInstance);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // get stream ID
    async getStreamInfos(input: JSON): Promise<{id: BigInt , observationType: string} | undefined> {
        Logs.class(this.constructor.name, "getStreamInfos");
        
        const streamEntity: Ientity | undefined = input["Datastream"] ? this.DBST.Datastreams : input["MultiDatastream"] ? this.DBST.MultiDatastreams : undefined;
        if(!streamEntity) return undefined;
        const searchKey = input[streamEntity.name] || input[streamEntity.singular];
        const streamId: string | undefined = searchKey["@iot.id"];
        if (streamId) {
            return await Common.dbContext.raw(queryAsJson({query: `SELECT "id", "observationType" FROM "${streamEntity.table}" WHERE id = ${BigInt(streamId)} LIMIT 1`, singular: true, count: false}))
            .then((res: object) => {
                const temp = res["rows"][0].results;                    
                return {id: temp["id"], observationType: temp["observationType"]};
            })
            .catch((error) => {
                Logs.error(error);
                    return undefined;
                });
            }
        }
        
        determineType(input: string): string {
            return isNaN(+input) ? "_resultnumbers" : "_resultnumber";
        }

        dateTZ(value: string) {
            //Create Date object from ISO string
            const date = new Date(value);
            //Get ms for date
            const time = date.getTime();
            //Check if timezoneOffset is positive or negative
            if (date.getTimezoneOffset() <= 0) {
              //Convert timezoneOffset to hours and add to Date value in milliseconds                              
              const final = time + (Math.abs(date.getTimezoneOffset() * 60000));
              //Convert from milliseconds to date and convert date back to ISO string                              
              return new Date(final).toISOString();
            } else {
              const final = time + (-Math.abs(date.getTimezoneOffset() * 60000));
              return new Date(final).toISOString();
            }
          }
        
    createListColumnsValues(type: "COLUMNS" | "VALUES", input: string[], observationType?: string): string[] {
            const res:string[] = [];
            const separateur = type === "COLUMNS" ? '"' : "'";            
            for (let elem of input) {
                switch (elem) {
                    case "result":
                        if (observationType) elem = _OBSERVATIONTYPES[observationType];            
                        break;
                    case "FeatureOfInterest/id":
                        elem = "featureofinterest_id";           
                        break;
                }
                res.push(isNaN(+elem) ? elem.endsWith("Z") ? `TO_TIMESTAMP('${this.dateTZ(elem)}', '${_DATEFORMATNOTIMEZONE}')::TIMESTAMP`: `${separateur}${elem}${separateur}` : elem);
            }    
            return res;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    testValue(inputValue: any): {
        key: string;
        value: string;
    } | undefined {
        if (inputValue != null && inputValue !== "" && !isNaN(Number(inputValue.toString()))) return { key: "_resultnumber", value: inputValue.toString() };
        else if (typeof inputValue == "object") return { key: "_resultnumbers", value: `{"${Object.values(inputValue).join('","')}"}` };
    }
    
    async getAll(): Promise<IreturnResult | undefined> {
        this.ctx.throw(400, { code: 400 });
    }
    
    async getSingle(idInput: bigint | string): Promise<IreturnResult | undefined> {
        this.ctx.throw(400, { code: 400 });
        return;
    }
    
    async add(dataInput: JSON): Promise<IreturnResult | undefined> {
        Logs.override(messagesReplace(messages.infos.classConstructor, [this.constructor.name, `add`]));  
          
        const returnValue: string[] = [];
        let total = 0;
        // verify is there JSON data
        if (this.ctx._datas) {
            const datasJson = JSON.parse(this.ctx._datas["datas"]);
            
            if (!datasJson["columns"]) this.ctx.throw(404, { code: 404, detail: messages.errors.noColumn });

            const myColumns: IcsvColumn[] = [];
            const testDatastreamID: bigint[] = [];
            const testFeatureOfInterestID: bigint[] = [];
            Object.keys(datasJson["columns"]).forEach((element: string) => {
                // the ID one is default created ID
                const tempFoiId = datasJson["columns"][element].featureOfInterest ? datasJson["columns"][element].featureOfInterest : "1";
                myColumns.push({
                    column: element,
                    datastream: datasJson["columns"][element].datastream,
                    featureOfInterest: tempFoiId
                });
                testDatastreamID.push(BigInt(datasJson["columns"][element].datastream));
                if (BigInt(tempFoiId) > 1) testFeatureOfInterestID.push(BigInt(tempFoiId));
            });

            const paramsFile: IcsvFile = {
                tempTable: `temp${Date.now().toString()}`,
                filename: this.ctx._datas["file"],
                columns: myColumns,
                header: datasJson["header"] && datasJson["header"] == true ? ", HEADER" : "",
                dataStreamId: BigInt(this.ctx._datas["nb"])
            };

            const testDatastream = await verifyId(Common.dbContext, testDatastreamID, this.DBST.Datastreams.table);

            if (!testDatastream) {
                Logs.debug("test Datastream ID", testDatastreamID);
                this.ctx.throw(404, {
                    code: 404, detail: testDatastreamID.length > 0 ? messages.errors.noId + testDatastreamID : messages.errors.noIds + testDatastreamID
                });
            }

            const testFeatureOfInterest = await verifyId(Common.dbContext, testFeatureOfInterestID, this.DBST.FeaturesOfInterest.table);

            if (!testFeatureOfInterest) {
                Logs.debug("test FeatureOfInterest ID", testFeatureOfInterestID);
                this.ctx.throw(404, {
                    code: 404, 
                    detail:
                        testFeatureOfInterestID.length > 0
                            ? `No id found for : ${testFeatureOfInterestID}`
                            : `One of id not found for : ${testFeatureOfInterestID}`
                });
            }

            await importCsv(this.ctx, Common.dbContext, paramsFile).then((res) => {
                total = res.length;
                res.forEach((element: string) => returnValue.push(this.linkBase.replace("CreateObservations", "Observations") + "(" + element + ")"));
            });

            Logs.debug("importCsv", "OK");
        } else { /// classic Create
            const dataStreamId = await this.getStreamInfos(dataInput);
            if (!dataStreamId) this.ctx.throw(404, { code: 404, detail: messages.errors.noStream}); 
            else {
                // const indexResult = dataInput["components"].indexOf("result");
                await asyncForEach(dataInput["dataArray"], async (elem: string[]) => {
                    const keys = ["datastream_id"].concat(this.createListColumnsValues("COLUMNS", dataInput["components"], dataStreamId.observationType));
                    const values = this.createListColumnsValues("VALUES", [String(dataStreamId.id), ...elem]);
                    const sql = `INSERT INTO "observation" (${keys}) VALUES (${values}) RETURNING id`;

                    await Common.dbContext.raw(sql).then((res: any) => {
                        returnValue.push(this.linkBase.replace("Create", "") + "(" + res["rows"][0].id + ")");
                        total += 1;
                    }).catch(async (error) => {
                        if (error.code === '23505') {
                            returnValue.push(`Duplicate (${elem})`);
                            if (dataInput["duplicate"] && dataInput["duplicate"].toUpperCase() === "DELETE" ) {
                                let delSql = `delete FROM "observation" WHERE 1=1`;
                                keys.forEach((e,i) => {
                                    delSql += ` AND ${e} = ${values[i]}`;
                                });
                                delSql += ` RETURNING id`;
                                await Common.dbContext.raw(delSql).then((res: any) => {
                                    returnValue.push(`delete id ==> ${res["rows"][0].id}`);
                                    total += 1;
                                }).catch((error) => {
                                    Logs.writeError(undefined, error);                      
                                });                                    
                            }
                        }
                        else this.ctx.throw(400, { code: 400, detail: error });
                    });             
                });
                return this.createReturnResult({
                    total: total,
                    body: returnValue
                });
            }
        }
        if (returnValue) {
            return this.createReturnResult({
                total: total,
                body: returnValue
            });
        }
    }

    async update(idInput: bigint | string, dataInput: object | undefined): Promise<IreturnResult | undefined> {
        this.ctx.throw(400, { code: 400 });
        return;
    }
    
    async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
        this.ctx.throw(400, { code: 400 });
        return;
    }
    }
