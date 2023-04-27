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
import { _STREAM} from "../constants";
import { Logs } from "../../logger";
import { IcsvColumn, IcsvFile, IreturnResult, IstreamInfos } from "../../types";
import { importCsv } from "../helpers";
import { asyncForEach, getEntityName } from "../../helpers";
import { messages, messagesReplace } from "../../messages/";
import { queryAsJson } from "../../helpers/returnFormats";
import { QUOTEDCOMA } from "../../constants";
import { EdatesType, EobservationType } from "../../enums";

export class CreateObservations extends Common {
    constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
        super(ctx, knexInstance);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // get stream ID


    async getStreamInfos(input: JSON): Promise<IstreamInfos | undefined> {
        Logs.class(this.constructor.name, "getStreamInfos");
        const stream: _STREAM = input["Datastream"] ? "Datastream" : input["MultiDatastream"] ? "MultiDatastream" : undefined;
        if(!stream) return undefined;
        const streamEntity = getEntityName(stream);
        if(!streamEntity) return undefined;
        const foiId: bigint | undefined = input["FeaturesOfInterest"] ? input["FeaturesOfInterest"] : undefined;       
        const searchKey = input[this.DBST[streamEntity].name] || input[this.DBST[streamEntity].singular];
        const streamId: string | undefined = isNaN(searchKey) ? searchKey["@iot.id"] : searchKey;
        if (streamId) {
            const query = `SELECT "id", "observationType", "_default_foi" FROM "${this.DBST[streamEntity].table}" WHERE id = ${BigInt(streamId)} LIMIT 1`;
            return await Common.dbContext.raw(queryAsJson({query: query, singular: true, count: false}))
            .then((res: object) => {
                const temp = res["rows"][0].results;                    
                return {type: stream, id: temp["id"], observationType: temp["observationType"], FoId: foiId ? foiId : temp["_default_foi"]};
            })
            .catch((error) => {                
                Logs.error(error);
                return undefined;
            });
            }
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
                        if (observationType) elem = EobservationType[observationType];            
                        break;
                    case "FeatureOfInterest/id":
                        elem = "featureofinterest_id";           
                        break;
                }                
                res.push(isNaN(+elem) ? typeof elem === "string" ? elem.endsWith("Z") ? `TO_TIMESTAMP('${this.dateTZ(elem)}', '${EdatesType.dateWithOutTimeZone}')::TIMESTAMP`: `${separateur}${elem}${separateur}` : `${separateur}{${elem}}${separateur}` : elem);
            }    
            return res;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    testValue(inputValue: any): {
        key: string;
        value: string;
    } | undefined {
        if (inputValue != null && inputValue !== "" && !isNaN(Number(inputValue.toString()))) return { key: "_resultnumber", value: inputValue.toString() };
        else if (typeof inputValue == "object") return { key: "_resultnumbers", value: `{"${Object.values(inputValue).join(QUOTEDCOMA)}"}` };
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
            const streamInfos: IstreamInfos[] = [];
            await asyncForEach(    
                Object.keys(datasJson["columns"]),
                  async (key: string) => {  
                    const tempStreamInfos = await this.getStreamInfos(datasJson["columns"][key] as JSON);
                    if(tempStreamInfos) {
                        streamInfos.push(tempStreamInfos);                     
                        myColumns.push({
                            column: key,
                            stream: tempStreamInfos
                        });
                    }


                  }
              );
              

            const paramsFile: IcsvFile = {
                tempTable: `temp${Date.now().toString()}`,
                filename: this.ctx._datas["file"],
                columns: myColumns,
                header: datasJson["header"] && datasJson["header"] == true ? ", HEADER" : "",
                stream: streamInfos
            };

            await importCsv(this.ctx, Common.dbContext, paramsFile).then((res) => {
                total = res.length;
                res.forEach((element: string) => returnValue.push(this.linkBase.replace("CreateObservations", "Observations") + "(" + element + ")"));
            });

            Logs.debug("importCsv", "OK");
        } else { /// classic Create
            const dataStreamId = await this.getStreamInfos(dataInput);
            if (!dataStreamId) this.ctx.throw(404, { code: 404, detail: messages.errors.noStream}); 
            else {
                await asyncForEach(dataInput["dataArray"], async (elem: string[]) => {
                    const keys = [`"${dataStreamId.type?.toLowerCase()}_id"`].concat(this.createListColumnsValues("COLUMNS", dataInput["components"], dataStreamId.observationType));
                    const values = this.createListColumnsValues("VALUES", [String(dataStreamId.id), ...elem]);
                    await Common.dbContext.raw(`INSERT INTO "observation" (${keys}) VALUES (${values}) RETURNING id`).then((res: any) => {
                        returnValue.push(this.linkBase.replace("Create", "") + "(" + res["rows"][0].id + ")");
                        total += 1;
                    }).catch(async (error) => {
                        if (error.code === '23505') {
                            returnValue.push(`Duplicate (${elem})`);
                            if (dataInput["duplicate"] && dataInput["duplicate"].toUpperCase() === "DELETE" ) {
                                await Common.dbContext.raw(`delete FROM "observation" WHERE 1=1 ` + keys.map((e,i) => `AND ${e} = ${values[i]}`).join(" ") + ` RETURNING id`).then((res: any) => {
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
