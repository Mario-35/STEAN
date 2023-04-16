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
import { importCsv, verifyId } from "../helpers";
import { asyncForEach, stringToBool } from "../../helpers";
import { messages, messagesReplace } from "../../messages/";
import { EstreamType } from "../../enums";

export class CreateObservations extends Common {
    constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
        super(ctx, knexInstance);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getStreamId(input: object, conn: Knex.Transaction<any, any[]>): BigInt {
        const streamType: EstreamType = input["Datastream"] ? EstreamType.Datastreams : input["MultiDatastream"] ? EstreamType.MultiDatastreams : EstreamType.None;
        if (streamType === EstreamType.None) return BigInt(-1);
        const streamId: string | undefined = input[streamType]["@iot.id"];
        if (streamId) {
            try {
                conn.raw(`SELECT id FROM "${_DBDATAS[streamType].table}" WHERE id = ${BigInt(streamId)} LIMIT 1`)
                .then((res: object) => BigInt(res["rows"][0].id));
            } catch (error) {
                return BigInt(-1);
            }
        }
        return BigInt(-1);

    }

    determineType(input: string): string {
        // console.log(input);
        
        return isNaN(+input) ? "_resultnumbers" : "_resultnumber";
    }
    
    createListColumnsValues(type: "COLUMNS" | "VALUES", input: string[], testType?: string): string {
        const res:string[] = [];
        const separateur = type === "COLUMNS" ? '"' : "'";
        for (let elem of input) {
            switch (elem) {
                case "result":
                    if (testType) elem = this.determineType(testType);            
                    break;
                case "FeatureOfInterest/id":
                    elem = "featureofinterest_id";           
                    break;
            }
            res.push(isNaN(+elem) ? `${separateur}${elem}${separateur}` : elem);
        }    
        return res.join();
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    testValue(inputValue: any): {
        key: string;
        value: string;
    } | undefined {
        if (inputValue != null && inputValue !== "" && !isNaN(Number(inputValue.toString()))) return { key: "_resultnumber", value: inputValue.toString() };
        else if (typeof inputValue == "object") return { key: "_resultnumbers", value: `{"${Object.values(inputValue).join('","')}"}` };
    }

    async add(dataInput: object): Promise<IreturnResult | undefined> {
        Logs.override(messagesReplace(messages.infos.classConstructor, [this.constructor.name, `add`]));    
        const returnValue: string[] = [];
        let total = 0;
        let doublons = 0;
        if (this.ctx._datas) {
            const extras = this.ctx._datas;
            const datasJson = JSON.parse(extras["datas"]);

            if (!datasJson["columns"]) this.ctx.throw(404, { code: 404, detail: messages.errors.noColumn });
            if (!datasJson["duplicates"]) datasJson["duplicates"] = true;

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
                filename: extras["file"],
                columns: myColumns,
                header: datasJson["header"] && datasJson["header"] == true ? ", HEADER" : "",
                dataStreamId: BigInt(extras["nb"]),
                duplicates: stringToBool(datasJson["duplicates"])
            };

            const testDatastream = await verifyId(Common.dbContext, testDatastreamID, _DBDATAS.Datastreams.table);

            if (!testDatastream) {
                Logs.debug("test Datastream ID", testDatastreamID);
                this.ctx.throw(404, {
                    code: 404, detail: testDatastreamID.length > 0 ? messages.errors.noId + testDatastreamID : messages.errors.noIds + testDatastreamID
                });
            }

            const testFeatureOfInterest = await verifyId(Common.dbContext, testFeatureOfInterestID, _DBDATAS.FeaturesOfInterest.table);

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
            const dataStreamId: string = dataInput["Datastream"]["@iot.id"];

            const DatastreamIdExist = await verifyId(Common.dbContext, BigInt(dataStreamId), _DBDATAS.Datastreams.table);
            if (!DatastreamIdExist) {
                this.ctx.throw(404, { code: 404, detail: messages.errors.noId + dataStreamId });
            }
            const indexResult = dataInput["components"].indexOf("result");
            await asyncForEach(dataInput["dataArray"], async (elem: string[]) => {
                const sql = `INSERT INTO "observation" ("datastream_id", ${this.createListColumnsValues("COLUMNS", dataInput["components"], elem[indexResult])}) VALUES (${this.createListColumnsValues("VALUES", [dataStreamId, ...elem])}) RETURNING id`;
                Logs.query(sql);
                await Common.dbContext.raw(sql).then((res: any) => {
                    returnValue.push(this.linkBase.replace("Create", "") + "(" + res["rows"][0].id + ")");
                    total += 1;
                }).catch((error: any) => {
                    console.log(error);
                    if (error.code = '23505') doublons += 1;
                    else this.ctx.throw(400, { code: 400, detail: error });
                });             
            });
            console.log(doublons);
            
            return this.createReturnResult({
                total: total,
                body: returnValue
            });
        }
        if (returnValue) {
            return this.createReturnResult({
                total: total,
                body: returnValue
            });
        }
    }
}
