/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TDD for Format API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
process.env.NODE_ENV = "test";

import chai from "chai";
import chaiHttp from "chai-http";
import { IApiDoc, generateApiDoc, IApiInput, prepareToApiDoc, limitResult } from "./constant";
import { server } from "../../server/index";

chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];

const addToApiDoc = (input: IApiInput) => {
    docs.push(prepareToApiDoc(input, "Format"));
};

addToApiDoc({
    api: `{infos} /Format Infos.`,
    apiName: "FormatInfos",
    apiDescription: `Format result json as default, dataArray, csv, txt,  graph or graphDatas, note that $value return result as text.`,
    result: ""
});

describe("Output formats", () => {
    describe("{get} resultFormat csv", () => {
        it("Return result in csv format.", (done) => {
            const infos = {
                api: `{get} ResultFormat as csv`,
                apiName: "FormatCsv",
                apiDescription: 'Use $resultFormat=csv to get datas as csv format.<br><img class="tabLogo" src="./assets/csv.jpg" alt="csv result">',
                apiExample: { http: "/v1.0/Datastreams(1)/Observations?$top=20&$resultFormat=csv" }
            };
            chai.request(server)
                .get(`/test${infos.apiExample.http}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("text/csv");
                    res.text.startsWith(`"@iot.${"id"}";`);
                    addToApiDoc({ ...infos, result: res });
                    done();
                });
        });
    });

    describe("{get} resultFormat dataArray", () => {
        it("Return Things in dataArray format.", (done) => {
            const infos = {
                api: `{get} Things Things as dataArray`,
                apiName: "FormatThingdataArray",
                apiDescription: 'Use $resultFormat=dataArray to get datas as dataArray format.',
                apiExample: { http: "/v1.0/Things?$resultFormat=dataArray" }
            };
            chai.request(server)
                .get(`/test${infos.apiExample.http}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    // res.body[0]["dataArray@iot.count"].eql(24);
                    res.body[0].component.length.should.eql(4);
                    res.body[0].component[0].should.eql("id");  
                    res.body[0].dataArray.length.should.eql(24);
                    res.body[0].dataArray = [res.body[0].dataArray[0], res.body[0].dataArray[1], " ... "];
                    addToApiDoc({ ...infos, result: res });
                    done();
                });
        });
        
        it("Return Datastream/Observations in dataArray format.", (done) => {
            const infos = {
                api: `{get} Datastream Observations as dataArray`,
                apiName: "FormatDataStreamdataArray",
                apiDescription: 'Use $resultFormat=dataArray to get datas as dataArray format.',
                apiExample: { http: "/v1.0/Datastreams(1)/Observations?$resultFormat=dataArray&$select=id,result" }
            };
            chai.request(server)
                .get(`/test${infos.apiExample.http}`)
                .end((err: Error, res: any) => { 
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    res.body[0].component.length.should.eql(2);
                    res.body[0]['dataArray@iot.count'].should.eql(23);
                    res.body[0].dataArray.length.should.eql(23);
                    // res.body[0].dataArray[1][1].should.eql(0.1);  
                    res.body[0].dataArray = [res.body[0].dataArray[0], res.body[0].dataArray[1], " ... "];
                    addToApiDoc({ ...infos, result: res});
                    done();
                });
        });
    });

    describe("{get} resultFormat graph", () => {
        it("Return result in graph format.", (done) => {
            const infos = {
                api: `{get} ResultFormat as graph`,
                apiName: "FormatGraph",
                apiDescription: 'Use $resultFormat=graph to get datas into graphical representation.<br><img class="tabLogo" src="./assets/graph.png" alt="graph result">',
                apiExample: { http: "/v1.0/Datastreams(1)/Observations?$resultFormat=graph" }
            };
            chai.request(server)
                .get(`/test${infos.apiExample.http}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("text/html");
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    done();
                });
        });
    });
    
    describe("{get} resultFormat graphDatas", () => {
        it("Return result in graphDatas format.", (done) => {
            const infos = {
                api: `{get} ResultFormat as graphDatas`,
                apiName: "FormatGraphDatas",
                apiDescription: "Use $resultFormat=graphDatas to get datas into echarts compatible format.",
                apiExample: { http: "/v1.0/Datastreams(1)/Observations?$resultFormat=graphDatas" },
                apiReference: "https://echarts.apache.org/en/index.html"
            };
            chai.request(server)
                .get(`/test${infos.apiExample.http}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    addToApiDoc({ ...infos, result: res });
                    done();
                });
        });
    });

    describe("Save apiDocFormat.", () => {
        it("Do not test only for save apiDoc", (done) => {
            generateApiDoc(docs, "apiDocFormat.js");
            done();
        });
    });
});
