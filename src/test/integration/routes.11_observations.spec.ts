/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TDD for things API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
process.env.NODE_ENV = "test";

import chai from "chai";
import chaiHttp from "chai-http";
import {
    IApiDoc,
    generateApiDoc,
    IApiInput,
    prepareToApiDoc,
    identification,
    keyTokenName,
    defaultDelete,
    defaultPatch,
    defaultPost,
    defaultGet,
    listOfColumns,
    limitResult,
    infos,
    apiInfos,
    showHide,
    nbColorTitle,
    nbColor,
    testVersion,
    _RAWDB,
    Iinfos
} from "./constant";
import { server } from "../../server/index";
import { Ientity } from "../../server/types";
import { testsKeys as Datastreams_testsKeys } from "./routes.07_datastreams.spec";
import { executeQuery, last } from "./executeQuery";
import { testDatas } from "../../server/db/createDb";
import { addDeleteTest, addGetTest, addPatchTest, addPostTest, addStartNewTest } from "./tests";
export const testsKeys = [
    "@iot.id",
    "@iot.selfLink",
    "Datastream@iot.navigationLink",
    "FeatureOfInterest@iot.navigationLink",
    "MultiDatastream@iot.navigationLink",
    "result",
    "phenomenonTime",
    "resultTime",
    "resultQuality",
    "validTime",
    "parameters"
];

chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];
const entity: Ientity = _RAWDB.Observations;


const addToApiDoc = (input: IApiInput) => {
    docs.push(prepareToApiDoc(input, entity.name));
};

addToApiDoc({
    api: `{infos} ${entity.name} infos`,
    apiName: `Infos${entity.name}`,    
    apiDescription: infos[entity.name].definition,
    apiReference: infos[entity.name].reference,
    result: ""
});

describe("endpoint : Observations", () => {
    const temp = listOfColumns(entity);
    const success = temp.success;
    const params = temp.params;
    let token = "";

    before((done) => {
        chai.request(server)
            .post(`/test/${testVersion}/login`)
            .send(identification)
            .end((err: Error, res: any) => {
                token = String(res.body["token"]);
                done();
            });
    });

    describe(`{get} ${entity.name} ${nbColorTitle}[9.2]`, () => {
		it(`Return all ${entity.name} ${nbColor}[9.2.2]`, (done) => {
			const infos: Iinfos = {
				api: `{get} ${entity.name} Get all`,
				url: `/${testVersion}/${entity.name}`,
				apiName: `GetAll${entity.name}`,
				apiDescription: `Retrieve all ${entity.name}.${showHide(`Get${entity.name}`, apiInfos["9.2.2"])}`,
				apiReference: "https://docs.ogc.org/is/18-088/18-088.html#usage-address-collection-entities",
				apiExample: {
					http: `/test`,
					curl: defaultGet("curl", "KEYHTTP"),
					javascript: defaultGet("javascript", "KEYHTTP"),
					python: defaultGet("python", "KEYHTTP")
				},
				apiSuccess: ["{number} id @iot.id", "{relation} selfLink @iot.selfLink", ...success]
			};

			chai.request(server)
				.get(`/test${infos.url}`)
				.end((err, res) => {
					addStartNewTest(entity.name);
					should.not.exist(err);
					res.status.should.equal(200);
					res.type.should.equal("application/json");
					addToApiDoc({
						...infos,
						result: limitResult(res)
					});
					docs[docs.length - 1].apiErrorExample = JSON.stringify({
						"code": 404,
						"message": "Not Found"
					}, null, 4);
					addGetTest(infos);
					done();
				});
		});

		it(`Return ${entity.name} id: 1 ${nbColor}[9.2.3]`, (done) => {
			const infos:Iinfos  = {
				api :`{get} ${entity.name}(:id) Get one`,
				url : `/${testVersion}/${entity.name}(1)`,
				apiName: `GetOne${entity.name}`,
				apiDescription: `Get a specific ${entity.singular}.${apiInfos["9.2.3"]}`,
				apiReference: "https://docs.ogc.org/is/18-088/18-088.html#usage-address-entity",
				apiExample: {
					http: "/test",
					curl: defaultGet("curl", "KEYHTTP"),
					javascript: defaultGet("javascript", "KEYHTTP"),
					python: defaultGet("python", "KEYHTTP")
				}
			};
            chai.request(server)
                .get(`/test${infos.url}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    res.body.should.include.keys(testsKeys);
                    res.body["@iot.selfLink"].should.contain(`/Observations(1)`);
                    res.body["@iot.id"].should.eql(1);
                    res.body["Datastream@iot.navigationLink"].should.contain(`/Observations(1)/Datastream`);
                    addToApiDoc({ ...infos, result: limitResult(res) });
					addGetTest(infos);
                    done();
                });
        });

		it(`Return error if ${entity.name} not exist ${nbColor}[9.2.4]`, (done) => {
			const infos:Iinfos  = {
				api : `{get} return error if ${entity.name} not exist`,
				url : `/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`,
				apiName: "",
				apiDescription: "",
				apiReference: ""
			};
			chai.request(server)
				.get(`/test${infos.url}`)
				.end((err, res) => {
					should.not.exist(err);
					res.status.should.equal(404);
					res.type.should.equal("application/json");
					docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4).replace(Number.MAX_SAFE_INTEGER.toString(), "1");
					addGetTest(infos);
					done();
				});
		});

        it(`Return all Observations in the Datastream that holds the id 2`, (done) => {
            const infos:Iinfos  = {
                api : `{get} Datastreams(2)/${entity.name} Get all from Datastream`,
                url : `/${testVersion}/Datastreams(2)/${entity.name}`,
                
                apiName: `GetDatastreams${entity.name}`,
                apiDescription: "Get Observations from Datastream.",
                apiExample: {
                    http: "/test",
                    curl: defaultGet("curl", "KEYHTTP"),
                    javascript: defaultGet("javascript", "KEYHTTP"),
                    python: defaultGet("python", "KEYHTTP")
                }
            };
            chai.request(server)
                .get(`/test${infos.url}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    res.body.should.include.keys("value");
                    addToApiDoc({ ...infos, result: limitResult(res) });
					addGetTest(infos);
                    done();
                });
        });

        // it(`Return all Observations references in the Datastream that holds the id 10`, (done) => {
        //     api : `{get} Datastreams(10)/${entity.name}/$ref get references from Datastream`;
		// 	const url = `GetDatastreams${entity.name}/$ref`;
        //     const infos:Iinfos  = {
        //         
        //         apiName: url,
        //         apiDescription: `Get ${entity.name}s refs from Datastreams`,
        //         apiExample: {
        //             http: `/${testVersion}/Datastreams(10)/${entity.name}/$ref`,
        //             curl: defaultGet("curl", "KEYHTTP"),
        //             javascript: defaultGet("javascript", "KEYHTTP"),
        //             python: defaultGet("python", "KEYHTTP")
        //         }
        //     };
        //     chai.request(server)
        //         .get(`/test${infos.url}`)
        //         .end((err: Error, res: any) => {
        //             should.not.exist(err);
        //             res.status.should.equal(200);
        //             res.type.should.equal("application/json");
        //             res.body.should.include.keys("value");
        //             res.body.value.length.should.eql(3);
        //             res.body.value[0]["@iot.selfLink"].should.contain("/Observations(8)");
        //             addToApiDoc({ ...infos, result: limitResult(res) });
		// 			addGetTest(infos);
        //             done();
        //         });
        // });

        it(`Return all Observations and $expand query option`, (done) => {
            const name = "Datastream";
            const infos:Iinfos  = {
                api : `{get} ${entity.name}(:id) Get Expands`,
                url : `/${testVersion}/${entity.name}(1)?$expand=${name}`,
                
                apiName: `GetExpandDatastreams${entity.name}`,
                apiDescription: "Get a specific Observation and expand Datastream.",
                apiExample: {
                    http: "/test",
                    curl: defaultGet("curl", "KEYHTTP"),
                    javascript: defaultGet("javascript", "KEYHTTP"),
                    python: defaultGet("python", "KEYHTTP")
                }
            };
            chai.request(server)
                .get(`/test${infos.url}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    res.body.should.include.keys(testsKeys.filter((elem) => elem !== "Datastream@iot.navigationLink"));
                    res.body.should.include.keys("Datastream");
                    res.body.Datastream.should.include.keys(Datastreams_testsKeys);
                    res.body["@iot.id"].should.eql(1);
                    addToApiDoc({ ...infos, result: limitResult(res) });
					addGetTest(infos);
                    done();
                });
        });

        it("Return Observations with multiple SELECT odata", (done) => {            
            const infos:Iinfos  = {
                api : `{get} ${entity.name}(:id) Get with Multi Select`,
                url : `/${testVersion}/${entity.name}(1)?$select=phenomenonTime,result`,
            apiName: `GetSelectPhenomenonTime${entity.name}`,
                apiDescription: "Retrieve specified phenomenonTime, result for a specific Observations.",
                apiExample: {
                    http: "/test",
                    curl: defaultGet("curl", "KEYHTTP"),
                    javascript: defaultGet("javascript", "KEYHTTP"),
                    python: defaultGet("python", "KEYHTTP")
                }
            };
            chai.request(server)
                .get(`/test${infos.url}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    Object.keys(res.body).length.should.eql(2);
                    res.body.should.include.keys("phenomenonTime");
                    res.body.should.include.keys("result");
                    addToApiDoc({ ...infos, result: limitResult(res) });
					addGetTest(infos);
                    done();
                });
        });

        it("Return Observations with multiple Standard result from multiDatastreams", (done) => {
            const infos:Iinfos  = {
                api : `{get} Observations with Standard Results`,
                url : `/${testVersion}/${entity.name}(11)`,                
                apiName: `GetSelectObservationsMultiStandardResult`,
                apiDescription: "Retrieve observations with multi result.",
                apiExample: {
                    http: "/test",
                    curl: defaultGet("curl", "KEYHTTP"),
                    javascript: defaultGet("javascript", "KEYHTTP"),
                    python: defaultGet("python", "KEYHTTP")
                }
            };
            chai.request(server)
                .get(`/test${infos.url}`)
                .end((err: Error, res: any) => {   
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    res.body.result.should.equal(300);
                    addToApiDoc({ ...infos, result: limitResult(res) });
					addGetTest(infos);
                    done();
                });
        });

        it("Return Observations with multiple result from multiDatastreams", (done) => {
            const infos:Iinfos  = {
                api : `{get} Observations with Multi keyValue Results`,
                url : `/${testVersion}/${entity.name}(378)?$valuesKeys=true`,                
                apiName: `GetSelectObservationsMultikeyValueResult`,
                apiDescription: "Retrieve observations with keyValue result.",
                apiExample: {
                    http: "/test",
                    curl: defaultGet("curl", "KEYHTTP"),
                    javascript: defaultGet("javascript", "KEYHTTP"),
                    python: defaultGet("python", "KEYHTTP")
                }
            };
            chai.request(server)
                .get(`/test${infos.url}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    res.body.result.should.include.keys("soil moisture");
                    res.body.result.should.include.keys("soil temperature");
                    res.body.result.should.include.keys("battery voltage");
                    addToApiDoc({ ...infos, result: limitResult(res) });
					addGetTest(infos);
                    done();
                });
        });

        it("Return errors with spliResult on Observation entity Only", (done) => {
            const infos:Iinfos  = {
                api : `Return error with spliResult on Observation entity Only`,
                url : `/${testVersion}/${entity.name}?$splitResult=ALL`,
                apiName: "",
                apiDescription: "",
                apiReference: ""
            };
            chai.request(server)
                .get(`/test${infos.url}`)
                .end((err: Error, res: any) => {
                    res.status.should.equal(400);
                    res.type.should.equal("application/json");
                    res.body.detail.should.contain("Split result not allowed");
					addGetTest(infos);
                    done();
                });
        });
        
        it("Return Observations with multiple result and split results", (done) => {
            const infos:Iinfos  = {
                api : `{get} Get with Split Results`,
                url : `/${testVersion}/MultiDatastreams(1)/${entity.name}?$splitResult=all`,
                apiName: `GetSelectObservationsSplitResultAll`,
                apiDescription: "Retrieve observations with splitted multi result.",
                apiExample: {
                    http: "/test",
                    curl: defaultGet("curl", "KEYHTTP"),
                    javascript: defaultGet("javascript", "KEYHTTP"),
                    python: defaultGet("python", "KEYHTTP")
                }
            };
            chai.request(server)
                .get(`/test${infos.url}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    Object.keys(res.body).length.should.eql(2);
                    res.body.value[0].should.include.keys(testDatas.MultiDatastreams[0].unitOfMeasurements[0].name);
                    res.body.value[0].should.include.keys(testDatas.MultiDatastreams[0].unitOfMeasurements[1].name);
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    addGetTest(infos);
                    done();
                });
        });

        it("Return Observations with multiple result and split result soil temperature", (done) => {
            const infos:Iinfos  = {
                api : `{get} Get with Split Result Property`,
                url: `/${testVersion}/MultiDatastreams(1)/${entity.name}?$splitResult="${testDatas.MultiDatastreams[0].unitOfMeasurements[0].name}"`,                
                apiName: `GetSelectObservationsSplitResultTemp`,
                apiDescription: "Retrieve observations with splitted Temperature result.",
                apiExample: {
                    http: "/test",
                    curl: defaultGet("curl", "KEYHTTP"),
                    javascript: defaultGet("javascript", "KEYHTTP"),
                    python: defaultGet("python", "KEYHTTP")
                }
            };
            chai.request(server)
                .get(`/test${infos.url}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    const id = res.body["@iot.count"];
                    Object.keys(res.body.value).length.should.eql(id);
                    res.body.value[0].should.include.keys(testDatas.MultiDatastreams[0].unitOfMeasurements[0].name);
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    addGetTest(infos);
                    done();
                });
        });


        // it("Return Observations with time intevval", (done) => {
        //     const infos:Iinfos  = {
        //         api: `{get} Get with interval`,
        //         apiName: `GetSelectObservationsInterval`,
        //         apiDescription: "Retrieve observations with 1 hour interval.",
        //         apiExample: {
        //             http: `/${testVersion}/Datastreams(1)/${entity.name}?$interval='1 hour'`,
        //             curl: defaultGet("curl", "KEYHTTP"),
        //             javascript: defaultGet("javascript", "KEYHTTP"),
        //             python: defaultGet("python", "KEYHTTP")
        //         }
        //     };
        //     chai.request(server)
        //         .get(`/test${infos.url}`)
        //         .end((err: Error, res: any) => {
        //             console.log(res.body);
                    
        //             should.not.exist(err);
        //             res.status.should.equal(200);
        //             res.type.should.equal("application/json");
        //             Object.keys(res.body).length.should.eql(2);
        //             Object.keys(res.body).length.should.eql(2);
        //             res.body.value[0].should.include.keys("result");
        //             res.body.value[0]["result"].should.eql(temp);
        //             addToApiDoc({ ...infos, result: limitResult(res) });
        //             done();
        //         });
        // });        
    });

    describe(`{post} ${entity.name} ${nbColorTitle}[10.2]`, () => {
        it(`Return added ${entity.name} ${nbColor}[10.2.1]`, (done) => {
            const datas = {
                "phenomenonTime": "2017-02-07T18:02:00.000Z",
                "resultTime": "2017-02-07T18:02:05.000Z",
                "result": 21.6,
                "Datastream": { "@iot.id": 2 }
            };
            const infos:Iinfos  = {
                api : `{post} ${entity.name} Post with existing FOI`,
                url : `/${testVersion}/${entity.name}`,                
                apiName: `Post${entity.name}`,
                apiDescription: `Post a new ${entity.name}.${showHide(`Post${entity.name}`, apiInfos["10.2"])}`,
                apiReference: "https://docs.ogc.org/is/18-088/18-088.html#link-existing-entities-when-creating",
                apiExample: {
                    http: "/test",
                    curl: defaultPost("curl", "KEYHTTP", datas),
                    javascript: defaultPost("javascript", "KEYHTTP", datas),
                    python: defaultPost("python", "KEYHTTP", datas)
                },
                apiParam: params,
                apiParamExample: datas
            };
            chai.request(server)
                .post(`/test${infos.url}`)
                .send(infos.apiParamExample)
                .set("Cookie", `${keyTokenName}=${token}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(201);
                    res.type.should.equal("application/json");
                    res.body.should.include.keys(testsKeys);
                    addToApiDoc({ ...infos, result: limitResult(res) });
					addPostTest(infos, datas);
                    done();
                });
        });

        it(`Return Error if the payload is malformed ${nbColor}[10.2.2]`, (done) => {
            const infos:Iinfos  = {
                api : `{post} return Error if the payload is malformed`,
                url : `/${testVersion}/${entity.name}`,
                apiName: "",
                apiDescription: "",
                apiReference: ""
            };
            chai.request(server)
                .post(`/test${infos.url}`)
                .send({})
                .set("Cookie", `${keyTokenName}=${token}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(400);
                    res.type.should.equal("application/json");
                    docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4);
                    addPostTest(infos, {});
                    done();
                });
        });

        it("Return updated Observation with FeatureOfInterest", (done) => {
            const datas = {
                "phenomenonTime": "2017-02-07T18:02:00.000Z",
                "resultTime": "2017-02-07T18:02:05.000Z",
                "result": 21.6,
                "FeatureOfInterest": {
                    "name": "Au Comptoir Vénitien (Created new location)",
                    "description": "Au Comptoir Vénitien",
                    "encodingType": "application/geo+json",
                    "feature": {
                        "type": "Point",
                        "coordinates": [48.11829243294942, -1.717928984533772]
                    }
                },
                "Datastream": { "@iot.id": 6 }
            };
            const infos:Iinfos  = {
                api : `{post} ${entity.name} Post with FOI`,
                url : `/${testVersion}/${entity.name}`,                
                apiName: `PostNewFoi${entity.name}`,
                apiDescription: "Post a new Observation.",
                apiReference: "https://docs.ogc.org/is/18-088/18-088.html#create-related-entities",
                apiExample: {
                    http: "/test",
                    curl: defaultPost("curl", "KEYHTTP", datas),
                    javascript: defaultPost("javascript", "KEYHTTP", datas),
                    python: defaultPost("python", "KEYHTTP", datas)
                },
                apiParamExample: datas
            };
            chai.request(server)
                .post(`/test${infos.url}`)
                .send(infos.apiParamExample)
                .set("Cookie", `${keyTokenName}=${token}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(201);
                    res.type.should.equal("application/json");
                    res.body.should.include.keys(testsKeys);
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    addPostTest(infos, datas);
                     done();
                });
        });

        it("Return updated from Datastream", (done) => {
            const datas = {
                "phenomenonTime": "2017-02-07T18:02:00.000Z",
                "resultTime": "2017-02-07T18:02:05.000Z",
                "result": 23
            };
            const infos:Iinfos  = {
                api : `{post} ${entity.name} Post from Datastream`,
                url : `/${testVersion}/Datastreams(10)/${entity.name}`,
                apiName: `PostDatastreams${entity.name}`,
                apiDescription: "POST Observation with existing Datastream.",
                apiReference: "https://docs.ogc.org/is/18-088/18-088.html#link-existing-entities-when-creating",
                apiExample: {
                    http: "/test",
                    curl: defaultPost("curl", "KEYHTTP", datas),
                    javascript: defaultPost("javascript", "KEYHTTP", datas),
                    python: defaultPost("python", "KEYHTTP", datas)
                },
                apiParamExample: datas
            };
            chai.request(server)
                .post(`/test${infos.url}`)
                .send(infos.apiParamExample)
                .set("Cookie", `${keyTokenName}=${token}`)
                .end(async (err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(201);
                    res.type.should.equal("application/json");
                    res.body.should.include.keys(testsKeys);
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    addPostTest(infos, datas);
                    done();
                });
        });

        it("Return updated Observation from Datastream with FeatureOfInterest", (done) => {
            const datas = {
                "phenomenonTime": "2017-02-07T18:02:00.000Z",
                "resultTime": "2017-02-07T18:02:05.000Z",
                "result": 21.6,
                "FeatureOfInterest": {
                    "name": "Au Comptoir Vénitien [7]",
                    "description": "Au Comptoir Vénitien",
                    "encodingType": "application/geo+json",
                    "feature": {
                        "type": "Point",
                        "coordinates": [48.11829243294942, -1.717928984533772]
                    }
                }
            };
            const infos:Iinfos  = {
                api : `{post} ${entity.name} Post from Datastream and FOI`,
                url : `/${testVersion}/Datastreams(10)/${entity.name}`,
                apiName: `PostObservationsDatastreamsFOI${entity.name}`,
                apiDescription: "POST Observation with existing Datastream.",
                apiReference: "https://docs.ogc.org/is/18-088/18-088.html#link-existing-entities-when-creating",
                apiExample: {
                    http: "/test",
                    curl: defaultPost("curl", "KEYHTTP", datas),
                    javascript: defaultPost("javascript", "KEYHTTP", datas),
                    python: defaultPost("python", "KEYHTTP", datas)
                },
                apiParamExample: datas
            };
            chai.request(server)
                .post(`/test${infos.url}`)
                .send(infos.apiParamExample)
                .set("Cookie", `${keyTokenName}=${token}`)
                .end(async (err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(201);
                    res.type.should.equal("application/json");
                    res.body.should.include.keys(testsKeys);
                    const observationId = res.body["@iot.id"];
                    executeQuery("select id::int from observation WHERE featureofinterest_id = (SELECT id from featureofinterest order by id desc limit 1);").then((testRes) => {
                            testRes["id"].should.eql(observationId);
                            addToApiDoc({ ...infos, result: limitResult(res) });
                            addPostTest(infos, datas);
                            done();
                        })
                        .catch((e) => console.log(e));
                });
        });

        it("Return updated Observation from MultiDatastream", (done) => {
            const datas = {
                "phenomenonTime": "2017-02-07T18:02:00.000Z",
                "resultTime": "2017-02-07T18:02:05.000Z",
                "result": {
                    "Unit one of apostrophe": 10.1,
                    "Unit two of apostrophe": 10.2
                },
                "FeatureOfInterest": {
                    "name": "Au Comptoir Vénitien",
                    "description": "Au Comptoir Vénitien",
                    "encodingType": "application/geo+json",
                    "feature": {
                        "type": "Point",
                        "coordinates": [48.11829243294942, -1.717928984533772]
                    }
                }
            };
            const infos:Iinfos  = {
                api : `{post} ${entity.name} Post from MultiDatastream`,
                url :  `/${testVersion}/MultiDatastreams(2)/${entity.name}`,                
                apiName: `PostFromMultiDatastreams${entity.name}`,
                apiDescription: "POST Observation with existing MultiDatastream.",
                apiReference: "https://docs.ogc.org/is/18-088/18-088.html#link-existing-entities-when-creating",
                apiExample: {
                    http: "/test",
                    curl: defaultPost("curl", "KEYHTTP", datas),
                    javascript: defaultPost("javascript", "KEYHTTP", datas),
                    python: defaultPost("python", "KEYHTTP", datas)
                },
                apiParamExample: datas
            };
            chai.request(server)
                .post(`/test${infos.url}`)
                .send(infos.apiParamExample)
                .set("Cookie", `${keyTokenName}=${token}`)
                .end(async (err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(201);
                    res.type.should.equal("application/json");
                    res.body.should.include.keys(testsKeys);
                    res.body.result[0].should.eql(10.1);
                    res.body.result[1].should.eql(10.2);
                    addPostTest(infos, datas);
                     done();
                });
        });

        it("Return error if There is no Stream", (done) => {
            const datas = {
                "phenomenonTime": "2017-02-07T18:02:00.000Z",
                "resultTime": "2017-02-07T18:02:05.000Z",
                "result": {
                    "Unit one of apostrophe": 10.1,
                    "Unit two of apostrophe": 10.2
                },
                "FeatureOfInterest": {
                    "name": "Au Comptoir Vénitien[9]",
                    "description": "Au Comptoir Vénitien",
                    "encodingType": "application/geo+json",
                    "feature": {
                        "type": "Point",
                        "coordinates": [48.11829243294942, -1.717928984533772]
                    }
                }
            };
            const infos:Iinfos  = {
                api : `{post} return error if There is no Stream`,
                url : `/${testVersion}/${entity.name}`,
                apiName: "",
                apiDescription: "",
                apiReference: ""
            };
            chai.request(server)
                .post(`/test${infos.url}`)
                .send(datas)
                .set("Cookie", `${keyTokenName}=${token}`)
                .end(async (err: any, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(404);
                    res.type.should.equal("application/json");
                    res.body.detail.should.eql("No Datastream or MultiDatastream found");
					addPostTest(infos, datas);
					done();
                });
        });

        it("Return error results are different of multiObservationDataTypes", (done) => {
            const datas = {
                "phenomenonTime": "2017-02-07T18:02:00.000Z",
                "resultTime": "2017-02-07T18:02:05.000Z",
                "result": {
                    "Unit one of apostrophe": 10.1
                },
                "FeatureOfInterest": {
                    "name": "Au Comptoir Vénitien[9]",
                    "description": "Au Comptoir Vénitien",
                    "encodingType": "application/geo+json",
                    "feature": {
                        "type": "Point",
                        "coordinates": [48.11829243294942, -1.717928984533772]
                    }
                }
            };
            const infos:Iinfos  = {
                api : `{post} ${entity.name} Post from MultiDatastream`,
                url :  `/${testVersion}/MultiDatastreams(2)/${entity.name}`,                
                apiName: `PostObservationsMultiDatastreams${entity.name}`,
                apiDescription: "POST Observation with existing MultiDatastream.",
                apiReference: "https://docs.ogc.org/is/18-088/18-088.html#link-existing-entities-when-creating",
                apiExample: {
                    http: "/test",
                    curl: defaultPost("curl", "KEYHTTP", datas),
                    javascript: defaultPost("javascript", "KEYHTTP", datas),
                    python: defaultPost("python", "KEYHTTP", datas)
                },
                apiParamExample: datas
            };
            chai.request(server)
                .post(`/test${infos.url}`)
                .send(infos.apiParamExample)
                .set("Cookie", `${keyTokenName}=${token}`)
                .end(async (err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(400);
                    res.type.should.equal("application/json");
                    res.body.detail.should.eql("Size of list of results (1) is not equal to size of unitOfMeasurements (2)");
					addPostTest(infos, datas);
					done();
                });
        });


    });

    describe(`{patch} ${entity.name} ${nbColorTitle}[10.3]`, () => {
        it(`Return updated ${entity.name} ${nbColor}[10.3.1]`, (done) => {
            executeQuery(last(entity.table, true)).then((result) => {
                    const datas = {
                        "phenomenonTime": "2016-11-18T11:04:15.790Z",
                        "resultTime": "2016-11-18T11:04:15.790Z"
                    };
					const infos:Iinfos  = {
                        api : `{patch} ${entity.name} Patch a Thing`,
                        url : `/${testVersion}/${entity.name}(${result["id"]})`,						
                        apiName: `Patch${entity.name}`,
                        apiDescription: `Patch a ${entity.singular}.${showHide(`Patch${entity.name}`, apiInfos["10.3"])}`,
                        apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_request_2",
                        apiExample: {
                            http: "/test",
                            curl: defaultPatch("curl", "KEYHTTP", datas),
                            javascript: defaultPatch("javascript", "KEYHTTP", datas),
                            python: defaultPatch("python", "KEYHTTP", datas)
                        },
                        apiParamExample: datas
                    };
                    chai.request(server)
                        .patch(`/test${infos.url}`)
                        .send(infos.apiParamExample)
                        .set("Cookie", `${keyTokenName}=${token}`)
                        .end((err: Error, res: any) => {
                            should.not.exist(err);
                            res.status.should.equal(200);
                            res.type.should.equal("application/json");
                            res.body.should.include.keys(testsKeys);
                            const newItems = res.body;
                            newItems.resultTime.should.not.eql(result["resultTime"]);
                            addToApiDoc({ ...infos, result: limitResult(res) });
							addPatchTest(infos, datas);
					done();
                        });
                });
        });
        it(`Return Error if the ${entity.name} not exist`, (done) => {
			const datas = {
                phenomenonTime: "2016-11-18T11:04:15.790Z",
                resultTime: "2016-11-18T11:04:15.790Z",
                result: 20.4,
                Datastream: { "@iot.id": 1 }
            };
			const infos: Iinfos = {
				api: `{patch} return Error if the ${entity.name} not exist`,
				url: `/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`,
				apiName: "",
				apiDescription: "",
				apiReference: ""
			};
			chai.request(server)
				.patch(`/test${infos.url}`)
				.send(datas)
				.set("Cookie", `${keyTokenName}=${token}`)
				.end((err: Error, res: any) => {
					should.not.exist(err);
					res.status.should.equal(404);
					res.type.should.equal("application/json");
					docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4);
					addPatchTest(infos, datas);
					done();
				});
		});

        it("Return updated Observation and Datastream", (done) => {
            executeQuery(last(entity.table, true)).then((result) => {
                    const datas = {
                        "phenomenonTime": "2016-11-18T11:04:15.790Z",
                        "resultTime": "2016-11-18T11:04:15.790Z",
                        "result": 20.4,
                        "Datastream": { "@iot.id": 6 }
                    };
                    const infos:Iinfos  = {
                        api : `{patch} ${entity.name} Patch with Datastream`,
                        url : `/${testVersion}/${entity.name}(${result["id"]})`,                        
                        apiName: `PatchDatastream${entity.name}`,
                        apiDescription: "Patch an Observation with Datastream.",
                        apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_request_2",
                        apiExample: {
                            http: "/test",
                            curl: defaultPatch("curl", "KEYHTTP", datas),
                            javascript: defaultPatch("javascript", "KEYHTTP", datas),
                            python: defaultPatch("python", "KEYHTTP", datas)
                        },
                        apiParamExample: datas
                    };
                    chai.request(server)
                        .patch(`/test${infos.url}`)
                        .send(infos.apiParamExample)
                        .set("Cookie", `${keyTokenName}=${token}`)
                        .end((err: Error, res: any) => {
                            should.not.exist(err);
                            res.status.should.equal(200);
                            res.type.should.equal("application/json");
                            res.body.should.include.keys(testsKeys);
                            const newItems = res.body;
                            newItems.result.should.not.eql(result["result"]);
                            addToApiDoc({ ...infos, result: limitResult(res) });
                            addPatchTest(infos, datas);
                            done();
                        });
                });
        });
    });

	describe(`{delete} ${entity.name} ${nbColorTitle}[10.4]`, () => {
		it(`Delete ${entity.name} return no content with code 204 ${nbColor}[10.4.1]`, (done) => {
			executeQuery(`SELECT (SELECT count(id) FROM "${entity.table}")::int as count, (${last(entity.table)})::int as id `).then((beforeDelete) => {
				const infos:Iinfos  = {
					api : `{delete} ${entity.name} Delete one`,
					url : `/${testVersion}/${entity.name}(${beforeDelete["id"]})`,					
					apiName: `Delete${entity.name}`,
					apiDescription: `Delete a ${entity.singular}.${showHide(`Delete${entity.name}`, apiInfos["10.4"])}`,
					apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_request_3",
					apiExample: {
						http: "/test",
						curl: defaultDelete("curl", "KEYHTTP"),
						javascript: defaultDelete("javascript", "KEYHTTP"),
						python: defaultDelete("python", "KEYHTTP")
					}
				};
				chai.request(server)
					.delete(`/test${infos.url}`)
					.set("Cookie", `${keyTokenName}=${token}`)
					.end((err: Error, res: any) => {
						should.not.exist(err);
						res.status.should.equal(204);
						executeQuery(`SELECT count(id)::int FROM "${entity.table}"`).then((afterDelete) => {
							afterDelete["count"].should.eql(beforeDelete["count"] - 1);
							addToApiDoc({
								...infos,
								result: res
							});
							addDeleteTest(infos);
							done();
						});
					});
			});
		});

		it(`Return Error if the ${entity.name} not exist`, (done) => {
			const infos: Iinfos = {
				api: `{delete} return Error if the ${entity.name} not exist`,
				url: `/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`,
				apiName: "",
				apiDescription: "",
				apiReference: ""
			};
			chai.request(server)
				.delete(`/test/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`)
				.set("Cookie", `${keyTokenName}=${token}`)
				.end((err: Error, res: any) => {
					should.not.exist(err);
					res.status.should.equal(404);
					res.type.should.equal("application/json");
					docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4);
					generateApiDoc(docs, `apiDoc${entity.name}.js`);
					addDeleteTest(infos);
					done();
				});
		});
	});
});
