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
    defaultPost,
    defaultPatch,
    defaultDelete,
    defaultGet,
    getNB,
    listOfColumns,
    limitResult,
    infos,
    apiInfos,
    showHide,
    nbColor,
    nbColorTitle
} from "./constant";
import { server } from "../../server/index";
import { dbTest } from "../dbTest";
import { _DB } from "../../server/db/constants";
import { Ientity } from "../../server/types";
import { testsKeys as datastreams_testsKeys } from "./routes.07_datastreams.spec";
export const testsKeys = ["@iot.id", "@iot.selfLink", "Datastreams@iot.navigationLink", "MultiDatastreams@iot.navigationLink", "Loras@iot.navigationLink","name", "description"];

chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];
const entity: Ientity = _DB.Sensors;


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

const _PARAMS: string[] = [
    "{String} [name] name of the Thing.",
    "{String} description description of the Thing.",
    "{ValueCode} encodingType encodingType ValueCode.",
    "{metadata} metadata depending on the value of the encodingType"
];

describe("endpoint : Sensors", () => {
    let myId = "";
    const temp = listOfColumns(entity);
    const success = temp.success;
    // const params = temp.params;
    let token = "";

    before((done) => {
        
    //     createListColumns(entity.table, (err: Error, value: any) => {
    //         columns = ["{number} id @iot.id", "{relation} selfLink @iot.selfLink", ...value];
    //         Object.keys(entity.relations).forEach((elem: string) => {
    //             columns.push(`{relation} ${elem} ${elem}@iot.navigationLink`);
    //         });
        chai.request(server)
            .post("/test/v1.0/login")
            .send(identification)
            .end((err: Error, res: any) => {
                token = String(res.body["token"]);
                done();
            });
    });

    describe(`{get} ${entity.name} ${nbColorTitle}[9.2]`, () => {
        it(`Return all ${entity.name} ${nbColor}[9.2.2]`, (done) => {
            const infos = {
                api: `{get} ${entity.name} Get all`,
                apiName: `GetAll${entity.name}`,
                                apiDescription: `Retrieve all ${entity.name}.${showHide(`Get${entity.name}`, apiInfos["9.2.2"])}`,
                apiReference: "https://docs.ogc.org/is/18-088/18-088.html#usage-address-collection-entities",
                apiExample: {
                    http: `/v1.0/${entity.name}`,
                    curl: defaultGet("curl", "KEYHTTP"),
                    javascript: defaultGet("javascript", "KEYHTTP"),
                    python: defaultGet("python", "KEYHTTP")
                },
                apiSuccess: success
            };
            dbTest("sensor")
                .count()
                .then((result) => {
                    const nb = Number(result[0]["count"]);
                    chai.request(server)
                        .get(`/test/v1.0/${entity.name}`)
                        .end((err, res) => {
                            should.not.exist(err);
                            res.status.should.equal(200);
                            res.type.should.equal("application/json");
                            res.body.value.length.should.eql(nb);
                            res.body.should.include.keys("@iot.count", "value");
                            res.body.value[0].should.include.keys(testsKeys);
                            addToApiDoc({ ...infos, result: limitResult(res) });
                            docs[docs.length - 1].apiErrorExample = JSON.stringify({ "code": 404, "message": "Not Found" }, null, 4);
                            done();
                        });
                });
        });

        it(`Return Sensor id: 1 ${nbColor}[9.2.3]`, (done) => {
            const infos = {
                api: `{get} ${entity.name}(:id) Get one`,
                apiName: `GetOne${entity.name}`,
                apiDescription: "Get a specific Sensor.",
                apiReference: "https://docs.ogc.org/is/18-088/18-088.html#usage-address-entity",
                apiExample: {
                    http: `/v1.0/${entity.name}(1)`,
                    curl: defaultGet("curl", "KEYHTTP"),
                    javascript: defaultGet("javascript", "KEYHTTP"),
                    python: defaultGet("python", "KEYHTTP")
                }
            };
            chai.request(server)
                .get(`/test/v1.0/${entity.name}(1)`)
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    res.body.should.include.keys(testsKeys);
                    res.body["@iot.selfLink"].should.contain("/Sensors(1)");
                    res.body["@iot.id"].should.eql(1);
                    res.body["Datastreams@iot.navigationLink"].should.contain("/Sensors(1)/Datastreams");
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    done();
                });
        });

        it("Return error if Sensor does not exist", (done) => {
            chai.request(server)
                .get(`/test/v1.0/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`)
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.equal(404);
                    res.type.should.equal("application/json");
                    docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4).replace(Number.MAX_SAFE_INTEGER.toString(), "1");
                    done();
                });
        });

        it(`Return Sensor using $expand query option ${nbColor}[9.3.2.1]`, (done) => {
            const infos = {
                api: `{get} ${entity.name}(:id) Get Expands`,
                apiName: `GetExpandDatastreams${entity.name}`,
                apiDescription: "Get a specific Sensor and expand Datastreams.",
                apiExample: {
                    http: `/v1.0/${entity.name}(1)?$expand=Datastreams`,
                    curl: defaultGet("curl", "KEYHTTP"),
                    javascript: defaultGet("javascript", "KEYHTTP"),
                    python: defaultGet("python", "KEYHTTP")
                }
            };
            chai.request(server)
                .get(`/test${infos.apiExample.http}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    res.body.should.include.keys(testsKeys.filter((elem) => elem !== "Datastreams@iot.navigationLink"));
                    res.body.should.include.keys("Datastreams");
                    res.body.Datastreams[0].should.include.keys(datastreams_testsKeys);
                    res.body["@iot.id"].should.eql(1);
                    addToApiDoc({ ...infos, result: limitResult(res, "Datastreams") });
                    done();
                });
        });

        it("Return Sensor with select=description", (done) => {
            const infos = {
                api: `{get} ${entity.name}(:id) Get Select`,
                apiName: `GetSelectDescription${entity.name}`,
                apiDescription: "Retrieve specified properties for a specific Sensor.",
                apiExample: {
                    http: `/v1.0/${entity.name}(1)?$select=description`,
                    curl: defaultGet("curl", "KEYHTTP"),
                    javascript: defaultGet("javascript", "KEYHTTP"),
                    python: defaultGet("python", "KEYHTTP")
                }
            };
            chai.request(server)
                .get(`/test${infos.apiExample.http}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    Object.keys(res.body).length.should.eql(1);
                    res.body.should.include.keys("description");
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    done();
                });
        });

        it(`Return Sensor Subentity Datastreams ${nbColor}[9.2.6]`, (done) => {
            const name = "Datastreams";
            chai.request(server)
                .get(`/test/v1.0/${entity.name}(1)/Datastreams`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    // res.body["@iot.count"].should.eql("2");
                    const id = Number(res.body.value[0]["@iot.id"]);
                    res.body.value[0]["@iot.selfLink"].should.contain(`/${name}(${id})`);
                    res.body.value[0]["Thing@iot.navigationLink"].should.contain(`/${name}(${id})/Thing`);
                    res.body.value[0]["Sensor@iot.navigationLink"].should.contain(`/${name}(${id})/Sensor`);
                    res.body.value[0]["ObservedProperty@iot.navigationLink"].should.contain(`/${name}(${id})/ObservedProperty`);
                    res.body.value[0]["Observations@iot.navigationLink"].should.contain(`/${name}(${id})/Observations`);
                    done();
                });
        });

        it(`Return Sensor Subentity MultiDatastreams ${nbColor}[9.2.6]`, (done) => {
            const name = "MultiDatastreams";
            chai.request(server)
                .get(`/test/v1.0/${entity.name}(1)/MultiDatastreams`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    const id = Number(res.body.value[0]["@iot.id"]);
                    res.body.value[0]["@iot.selfLink"].should.contain(`/${name}(${id})`);
                    res.body.value[0]["Thing@iot.navigationLink"].should.contain(`/${name}(${id})/Thing`);
                    res.body.value[0]["Sensor@iot.navigationLink"].should.contain(`/${name}(${id})/Sensor`);
                    res.body.value[0]["ObservedProperties@iot.navigationLink"].should.contain(`/${name}(${id})/ObservedProperties`);
                    res.body.value[0]["Observations@iot.navigationLink"].should.contain(`/${name}(${id})/Observations`);
                    done();
                });
        });

        it(`Return Sensor Expand Datastreams ${nbColor}[9.3.2.1]`, (done) => {
            const name = "Datastreams";
            chai.request(server)
                .get(`/test/v1.0/${entity.name}(1)?$expand=${name}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    const id = Number(res.body[name][0]["@iot.id"]);
                    res.body[name][0]["@iot.selfLink"].should.contain(`/${name}(${id})`);
                    res.body[name][0]["Thing@iot.navigationLink"].should.contain(`/${name}(${id})/Thing`);
                    res.body[name][0]["Sensor@iot.navigationLink"].should.contain(`/${name}(${id})/Sensor`);
                    res.body[name][0]["ObservedProperty@iot.navigationLink"].should.contain(`/${name}(${id})/ObservedProperty`);
                    res.body[name][0]["Observations@iot.navigationLink"].should.contain(`/${name}(${id})/Observations`);
                    done();
                });
        });

        it(`Return Sensor Expand MultiDatastreams ${nbColor}[9.3.2.1]`, (done) => {
            const name = "MultiDatastreams";
            chai.request(server)
                .get(`/test/v1.0/${entity.name}(3)?$expand=${name}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    const id = Number(res.body[name][0]["@iot.id"]);
                    res.body[name][0]["@iot.selfLink"].should.contain(`/${name}(${id})`);
                    res.body[name][0]["Thing@iot.navigationLink"].should.contain(`/${name}(${id})/Thing`);
                    res.body[name][0]["Sensor@iot.navigationLink"].should.contain(`/${name}(${id})/Sensor`);
                    res.body[name][0]["ObservedProperties@iot.navigationLink"].should.contain(`/${name}(${id})/ObservedProperties`);
                    res.body[name][0]["Observations@iot.navigationLink"].should.contain(`/${name}(${id})/Observations`);
                    done();
                });
        });
    });

    describe(`{post} ${entity.name} ${nbColorTitle}[10.2]`, () => {
        it(`Return added ${entity.name} ${nbColor}[10.2.1]`, (done) => {
            const datas = {
                description: "PM 2.5 sensor",
                name: `PM25 ${getNB(entity.name)}`,
                encodingType: "application/pdf",
                metadata: "http://particle-sensor.com/"
            };
            const infos = {
                api: `{post} ${entity.name} Post basic`,
                apiName: `Post${entity.name}`,
                apiDescription: `Post a new ${entity.name}.${showHide(`Post${entity.name}`, apiInfos["10.2"])}`,
                apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_request",
                apiExample: {
                    http: `/v1.0/${entity.name}`,
                    curl: defaultPost("curl", "KEYHTTP", datas),
                    javascript: defaultPost("javascript", "KEYHTTP", datas),
                    python: defaultPost("python", "KEYHTTP", datas)
                },
                apiParam: _PARAMS.slice(0, 4),
                apiParamExample: datas
            };
            chai.request(server)
                .post(`/test${infos.apiExample.http}`)
                .send(infos.apiParamExample)
                .set("Cookie", `${keyTokenName}=${token}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(201);
                    res.type.should.equal("application/json");
                    res.body.should.include.keys(testsKeys);
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    done();
                });
        });

        it(`Return Error if the payload is malformed ${nbColor}[10.2.2]`, (done) => {
            chai.request(server)
                .post("/test/v1.0/Sensors")
                .send({})
                .set("Cookie", `${keyTokenName}=${token}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(400);
                    res.type.should.equal("application/json");
                    docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4);
                    done();
                });
        });
    });

    describe(`{patch} ${entity.name} ${nbColorTitle}[10.3]`, () => {
        it(`Return updated ${entity.name} ${nbColor}[10.3.1]`, (done) => {
            dbTest("sensor")
                .select("*")
                .orderBy("id")
                .then((items) => {
                    const itemObject = items[items.length - 1];
                    myId = itemObject.id;
                    const datas = {
                        description: "This is a new PM 2.5 sensor"
                    };
                    const infos = {
                        api: `{patch} ${entity.name} Patch one`,
                        apiName: `Patch${entity.name}`,
                        apiDescription: "Patch a Sensor.",
                        apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_request_2",
                        apiExample: {
                            http: `/v1.0/${entity.name}(${myId})`,
                            curl: defaultPatch("curl", "KEYHTTP", datas),
                            javascript: defaultPatch("javascript", "KEYHTTP", datas),
                            python: defaultPatch("python", "KEYHTTP", datas)
                        },
                        apiParamExample: datas
                    };
                    chai.request(server)
                        .patch(`/test${infos.apiExample.http}`)
                        .send(infos.apiParamExample)
                        .set("Cookie", `${keyTokenName}=${token}`)
                        .end((err: Error, res: any) => {
                            should.not.exist(err);
                            res.status.should.equal(200);
                            res.type.should.equal("application/json");
                            res.body.should.include.keys(testsKeys);
                            const newItems = res.body;
                            newItems.description.should.not.eql(itemObject.description);
                            addToApiDoc({
                                api: `{patch} ${entity.name} Get one`,
                                apiName: `Patch${entity.name}`,
                                apiDescription: "Patch a sensor.",
                                apiParam: _PARAMS.slice(0, 4),
                                result: res
                            });
                            done();
                        });
                });
        });

        it("should throw an error if the sensor does not exist", (done) => {
            chai.request(server)
                .patch(`/test/v1.0/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`)
                .send({
                    description: "This is a new PM 2.5 sensor"
                })
                .set("Cookie", `${keyTokenName}=${token}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(404);
                    res.type.should.equal("application/json");

                    docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4);
                    done();
                });
        });
    });

    describe(`{delete} ${entity.name} ${nbColorTitle}[10.4]`, () => {
        it(`Delete ${entity.name} return no content with code 204 ${nbColor}[10.4.1]`, (done) => {
            dbTest("sensor")
                .select("*")
                .orderBy("id")
                .then((items) => {
                    const itemObject = items[items.length - 1];
                    const lengthBefore = items.length;
                    myId = itemObject.id;
                    const infos = {
                        api: `{delete} ${entity.name} Delete one`,
                        apiName: `Delete${entity.name}`,
                        apiDescription: `Delete a ${entity.singular}.${showHide(`Delete${entity.name}`, apiInfos["10.4"])}`,
                        apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_request_3",
                        apiExample: {
                            http: `/v1.0/${entity.name}(${myId})`,
                            curl: defaultDelete("curl", "KEYHTTP"),
                            javascript: defaultDelete("javascript", "KEYHTTP"),
                            python: defaultDelete("python", "KEYHTTP")
                        }
                    };

                    chai.request(server)
                        .delete(`/test${infos.apiExample.http}`)
                        .set("Cookie", `${keyTokenName}=${token}`)
                        .end((err: Error, res: any) => {
                            should.not.exist(err);
                            res.status.should.equal(204);
                            dbTest("sensor")
                                .select("*")
                                .orderBy("id")
                                .then((newItems) => {
                                    newItems.length.should.eql(lengthBefore - 1);
                                    addToApiDoc({ ...infos, result: limitResult(res) });
                                    done();
                                });
                        });
                });
        });
        it("Return Error if the Sensor does not exist", (done) => {
            chai.request(server)
                .delete(`/test/v1.0/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`)
                .set("Cookie", `${keyTokenName}=${token}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(404);
                    res.type.should.equal("application/json");
                    docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4).replace(Number.MAX_SAFE_INTEGER.toString(), myId);
                    generateApiDoc(docs, `apiDoc${entity.name}.js`);
                    
                    done();
                });
        });
    });
});
