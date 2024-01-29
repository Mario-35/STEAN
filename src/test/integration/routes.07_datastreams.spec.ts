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
    defaultGet,
    defaultDelete,
    defaultPost,
    defaultPatch,
    getNB,
    listOfColumns,
    limitResult,
    infos,
    apiInfos,
    showHide,
    nbColor,
    nbColorTitle,
    testVersion,
    _RAWDB
} from "./constant";
import { server } from "../../server/index";
import { Ientity } from "../../server/types";

import { testsKeys as Observations_testsKeys } from "./routes.11_observations.spec";
import { count, executeQuery, last } from "./executeQuery";

export const testsKeys = [
    "@iot.id",
    "name",
    "description",
    "observationType",
    "@iot.selfLink",
    "Thing@iot.navigationLink",
    "Sensor@iot.navigationLink",
    "ObservedProperty@iot.navigationLink",
    "Observations@iot.navigationLink",
    "unitOfMeasurement",
    "observedArea"
];

chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];
const entity: Ientity = _RAWDB.Datastreams;

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

let firstID = 0;

describe("endpoint : Datastream", () => {
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
            const infos = {
                api: `{get} ${entity.name} Get all`,
                apiName: `GetAll${entity.name}`,
                apiDescription: `Retrieve all ${entity.name}.${showHide(`Get${entity.name}`, apiInfos["9.2.2"])}`,
                apiReference: "https://docs.ogc.org/is/18-088/18-088.html#usage-address-collection-entities",
                apiExample: {
                    http: `/${testVersion}/${entity.name}`,
                    curl: defaultGet("curl", "KEYHTTP"),
                    javascript: defaultGet("javascript", "KEYHTTP"),
                    python: defaultGet("python", "KEYHTTP")
                },
                apiSuccess: ["{number} id @iot.id", "{relation} selfLink @iot.selfLink", ...success]
            };
            executeQuery(count(entity.table)).then((result) => {
                    chai.request(server)
                        .get(`/test/${testVersion}/${entity.name}`)
                        .end((err, res) => {
                            should.not.exist(err);
                            res.status.should.equal(200);
                            res.type.should.equal("application/json");
                            res.body.value.length.should.eql(result["count"]);
                            res.body.should.include.keys("@iot.count", "value");
                            res.body.value[0].should.include.keys(testsKeys);
                            addToApiDoc({ ...infos, result: limitResult(res) });
                            firstID = res.body.value[0]["@iot.id"];
                            docs[docs.length - 1].apiErrorExample = JSON.stringify({ "code": 404, "message": "Not Found" }, null, 4);

                            done();
                        });
                });
        });

        it(`Return ${entity.name} id: ${firstID} ${nbColor}[9.2.3]`, (done) => {
            const id: number = firstID;
            const infos = {
                api: `{get} ${entity.name}(:id) Get one`,
                apiName: `GetOne${entity.name}`,
                apiDescription: "Get a specific Datastream.",
                apiReference: "https://docs.ogc.org/is/18-088/18-088.html#usage-address-entity",
                apiExample: {
                    http: `/${testVersion}/${entity.name}(${id})`,
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
                    res.body.should.include.keys(testsKeys);
                    res.body["@iot.id"].should.eql(id);
                    res.body["@iot.selfLink"].should.contain(`/Datastreams(${id})`);
                    res.body["Sensor@iot.navigationLink"].should.contain(`/Datastreams(${id})/Sensor`);
                    res.body["ObservedProperty@iot.navigationLink"].should.contain(`/Datastreams(${id})/ObservedProperty`);
                    res.body["Observations@iot.navigationLink"].should.contain(`/Datastreams(${id})/Observations`);
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    done();
                });
        });

        it(`Return error if ${entity.name} not exist ${nbColor}[9.2.4]`, (done) => {
            chai.request(server)
                .get(`/test/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`)
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.equal(404);
                    res.type.should.equal("application/json");
                    docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4).replace(Number.MAX_SAFE_INTEGER.toString(), firstID.toString());
                    done();
                });
        });

        it(`Return ${entity.name} of a specific Thing`, (done) => {
            const id = 6;
            const infos = {
                api: `{get} Things(${id})/${entity.name} Get from a specific Thing`,
                apiName: `GetThings${entity.name}`,
                apiDescription: "Get Datastream(s) from Things.",
                apiExample: {
                    http: `/${testVersion}/Things(${id})/${entity.name}`,
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
                    res.body.should.include.keys("value");
                    res.body.value[0].should.include.keys(testsKeys);
                    res.body["@iot.count"].should.eql(3);
                    res.body.value.length.should.eql(3);
                    res.body.value[0]["@iot.id"].should.eql(8);
                    res.body.value[0]["@iot.selfLink"].should.contain("/Datastreams(8)");
                    res.body.value[0]["Sensor@iot.navigationLink"].should.contain("/Datastreams(8)/Sensor");
                    res.body.value[0]["ObservedProperty@iot.navigationLink"].should.contain("/Datastreams(8)/ObservedProperty");
                    res.body.value[0]["Observations@iot.navigationLink"].should.contain("/Datastreams(8)/Observations");
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    done();
                });
        });

        it(`Return ${entity.name} with inline related entities information using $expand query option`, (done) => {
            const infos = {
                api: `{get} ${entity.name}(:id) Get Expands`,
                apiName: `GetExpandObservations${entity.name}`,
                apiDescription: "Get a specific Datastream with expand Observations and ObservedProperty.",
                apiExample: {
                    http: `/${testVersion}/${entity.name}(10)?$expand=Observations,ObservedProperty`,
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
                    res.body.should.include.keys(
                        testsKeys.filter((elem) => !["Observations@iot.navigationLink", "ObservedProperty@iot.navigationLink"].includes(elem))
                    );
                    res.body.should.include.keys("Observations");
                    // res.body.Observations.length.should.eql(9);
                    res.body.Observations[0].should.include.keys(Observations_testsKeys);
                    res.body["@iot.id"].should.eql(10);
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    done();
                });
        });

        it(`Return ${entity.name} All infos`, (done) => {
            const infos = {
                api: `{get} ${entity.name}(:id) Get All infos`,
                apiName: `GetAllInfos${entity.name}`,
                apiDescription: "Get all infos of a datastream.",
                apiExample: {
                    http: `/${testVersion}/${entity.name}(10)?$expand=Thing/Locations,Sensor,ObservedProperty`,
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
                    res.body["Thing"]["Locations"][0]['@iot.id'].should.eql(1);
                    res.body["Thing"]['@iot.id'].should.eql(6);
                    res.body["Sensor"]['@iot.id'].should.eql(5);
                    res.body["ObservedProperty"]['@iot.id'].should.eql(8);
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    done();
                });
        });

        it(`Return error if ${entity.name} Path is invalid`, (done) => {
            chai.request(server)
                .get(`/test/${testVersion}/${entity.name}(2)?$expand=Things/Locations,Sensor,ObservedProperty`)
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.equal(400);
                    res.type.should.equal("application/json");
                    res.body["detail"].should.contain(`Invalid expand path`);
                    done();
                });
        });

        it(`Return ${entity.name} phenomenonTime search`, (done) => {
            const infos = {
                api: `{get} ${entity.name} Get From phenomenonTime search`,
                apiName: `GetPhenomenonTime${entity.name}`,
                apiDescription: "Get Datastream(s) from phenomenonTime filter.",
                apiExample: {
                    http: `/${testVersion}/${entity.name}?$filter=resultTime eq 2016-11-09T04:15:15Z/2016-11-14T03:15:15Z`,
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
                    res.body["@iot.count"].should.eql(1);
                    res.body.value[0]["@iot.id"].should.eql(2);
                    addToApiDoc({ ...infos, result: res });
                    done();
                });
        });

        it(`Return ${entity.name} from an observation filter`, (done) => {
            const infos = {
                api: `{get} ${entity.name} Get From observations filter`,
                apiName: `GetObservationFilter${entity.name}`,
                apiDescription: "Get Datastream(s) from Observations filter.",
                apiExample: {
                    http: `/${testVersion}/${entity.name}?$filter=Observations/result eq 23`,
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
                    res.body.should.include.keys("value");
                    res.body.value[0].should.include.keys(testsKeys);
                    res.body["@iot.count"].should.eql(1);
                    res.body.value.length.should.eql(1);
                    res.body.value[0]["@iot.id"].should.eql(10);
                    res.body.value[0]["@iot.selfLink"].should.contain("/Datastreams(10)");
                    addToApiDoc({ ...infos, result: res });
                    done();
                });
        });

        it(`Return ${entity.name} Subentity Thing ${nbColor}[9.2.6]`, (done) => {
            const name = "Thing";
            chai.request(server)
                .get(`/test/${testVersion}/${entity.name}(2)/${name}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    res.body["@iot.count"].should.eql(1);
                    const id = res.body.value[0]["@iot.id"];
                    res.body.value[0]["@iot.selfLink"].should.contain(`/${name}s(${id})`);
                    res.body.value[0]["Locations@iot.navigationLink"].should.contain(`/${name}s(${id})/Locations`);
                    res.body.value[0]["HistoricalLocations@iot.navigationLink"].should.contain(`/${name}s(${id})/HistoricalLocations`);
                    res.body.value[0]["Datastreams@iot.navigationLink"].should.contain(`/${name}s(${id})/Datastreams`);
                    res.body.value[0]["MultiDatastreams@iot.navigationLink"].should.contain(`/${name}s(${id})/MultiDatastreams`);
                    done();
                });
        });

        it(`Return ${entity.name} Subentity Sensor ${nbColor}[9.2.6]`, (done) => {
            const name = "Sensor";
            chai.request(server)
                .get(`/test/${testVersion}/${entity.name}(2)/${name}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    res.body["@iot.count"].should.eql(1);
                    const id = res.body.value[0]["@iot.id"];
                    res.body.value[0]["@iot.selfLink"].should.contain(`/Sensors(${id})`);
                    res.body.value[0]["Datastreams@iot.navigationLink"].should.contain(`/Sensors(${id})/Datastreams`);
                    res.body.value[0]["MultiDatastreams@iot.navigationLink"].should.contain(`/Sensors(${id})/MultiDatastreams`);
                    done();
                });
        });

        it(`Return ${entity.name} Subentity ObservedProperty ${nbColor}[9.2.6]`, (done) => {
            const name = "ObservedProperty";
            chai.request(server)
                .get(`/test/${testVersion}/${entity.name}(2)/${name}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    res.body["@iot.count"].should.eql(1);
                    const id = res.body.value[0]["@iot.id"];
                    res.body.value[0]["@iot.selfLink"].should.contain(`/ObservedProperties(${id})`);
                    res.body.value[0]["Datastreams@iot.navigationLink"].should.contain(`/ObservedProperties(${id})/Datastreams`);
                    res.body.value[0]["MultiDatastreams@iot.navigationLink"].should.contain(`/ObservedProperties(${id})/MultiDatastreams`);
                    done();
                });
        });

        it(`Return ${entity.name} Subentity Observations ${nbColor}[9.2.6]`, (done) => {
            const name = "Observations";
            chai.request(server)
                .get(`/test/${testVersion}/${entity.name}(1)/${name}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    const id = res.body.value[0]["@iot.id"];
                    res.body.value[0]["@iot.selfLink"].should.contain(`/${name}(${id})`);
                    res.body.value[0]["Datastream@iot.navigationLink"].should.contain(`/${name}(${id})/Datastream`);
                    res.body.value[0]["MultiDatastream@iot.navigationLink"].should.contain(`/${name}(${id})/MultiDatastream`);
                    res.body.value[0]["FeatureOfInterest@iot.navigationLink"].should.contain(`/${name}(${id})/FeatureOfInterest`);
                    done();
                });
        });

        it(`Return ${entity.name} Expand Things ${nbColor}[9.3.2.1]`, (done) => {
            const name = "Thing";
            chai.request(server)
                .get(`/test/${testVersion}/${entity.name}(2)?$expand=${name}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    const id = Number(res.body[name]["@iot.id"]);
                    res.body[name]["@iot.selfLink"].should.contain(`/Things(${id})`);
                    res.body[name]["Locations@iot.navigationLink"].should.contain(`Things(${id})/Locations`);
                    res.body[name]["HistoricalLocations@iot.navigationLink"].should.contain(`/Things(${id})/HistoricalLocations`);
                    res.body[name]["Datastreams@iot.navigationLink"].should.contain(`Things(${id})/Datastreams`);
                    res.body[name]["MultiDatastreams@iot.navigationLink"].should.contain(`Things(${id})/MultiDatastreams`);
                    done();
                });
        });

        it(`Return ${entity.name} Expand Sensor ${nbColor}[9.3.2.1]`, (done) => {
            const name = "Sensor";
            chai.request(server)
                .get(`/test/${testVersion}/${entity.name}(2)?$expand=${name}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    const id = Number(res.body[name]["@iot.id"]);
                    res.body[name]["@iot.selfLink"].should.contain(`/Sensors(${id})`);
                    res.body[name]["Datastreams@iot.navigationLink"].should.contain(`Sensors(${id})/Datastreams`);
                    res.body[name]["MultiDatastreams@iot.navigationLink"].should.contain(`Sensors(${id})/MultiDatastreams`);
                    done();
                });
        });

        it(`Return ${entity.name} Expand Observations ${nbColor}[9.3.2.1]`, (done) => {
            const name = "Observations";
            chai.request(server)
                .get(`/test/${testVersion}/${entity.name}(1)?$expand=${name}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    const id = Number(res.body[name][0]["@iot.id"]);
                    res.body[name][0]["@iot.selfLink"].should.contain(`/Observations(${id})`);
                    res.body[name][0]["FeatureOfInterest@iot.navigationLink"].should.contain(`/Observations(${id})/FeatureOfInterest`);
                    res.body[name][0]["Datastream@iot.navigationLink"].should.contain(`Observations(${id})/Datastream`);
                    res.body[name][0]["MultiDatastream@iot.navigationLink"].should.contain(`Observations(${id})/MultiDatastream`);
                    done();
                });
        });

        it(`Return ${entity.name} Expand ObservedProperty ${nbColor}[9.3.2.1]`, (done) => {
            const name = "ObservedProperty";
            chai.request(server)
                .get(`/test/${testVersion}/${entity.name}(1)?$expand=${name}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    const id = Number(res.body[name]["@iot.id"]);
                    res.body[name]["@iot.selfLink"].should.contain(`/ObservedProperties(${id})`);
                    res.body[name]["Datastreams@iot.navigationLink"].should.contain(`ObservedProperties(${id})/Datastreams`);
                    res.body[name]["MultiDatastreams@iot.navigationLink"].should.contain(`ObservedProperties(${id})/MultiDatastreams`);
                    done();
                });
        });
    });

    describe(`{post} ${entity.name} ${nbColorTitle}[10.2]`, () => {
        let myError = "";
        it(`Return added ${entity.name} ${nbColor}[10.2.1]`, (done) => {
            const datas = {
                "unitOfMeasurement": {
                    "symbol": "μg/m³",
                    "name": "PM 2.5 Particulates (ug/m3)",
                    "definition": "http://unitsofmeasure.org/ucum.html"
                },
                "description": `Air quality readings ${getNB(entity.name)}`,
                "name": `Air quality readings ${getNB(entity.name)}`,
                "Thing": { "@iot.id": 1 },
                "ObservedProperty": { "@iot.id": 1 },
                "Sensor": { "@iot.id": 1 }
            };
            const infos = {
                api: `{post} ${entity.name} Post with existing Thing`,
                apiName: `Post${entity.name}`,
                apiDescription: `Post a new ${entity.name}.${showHide(`Post${entity.name}`, apiInfos["10.2"])}`,
                apiReference: "https://docs.ogc.org/is/18-088/18-088.html#link-existing-entities-when-creating",
                apiExample: {
                    http: `/${testVersion}/${entity.name}`,
                    curl: defaultPost("curl", "KEYHTTP", datas),
                    javascript: defaultPost("javascript", "KEYHTTP", datas),
                    python: defaultPost("python", "KEYHTTP", datas)
                },
                apiParam: params,
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

        it(`Return added ${entity.name} with default FOI`, (done) => {
            const datas = {
                "unitOfMeasurement": {
                    "symbol": "μg/m³",
                    "name": "PM 2.5 Particulates (ug/m3)",
                    "definition": "http://unitsofmeasure.org/ucum.html"
                },
                "description": "Air quality readings with default",
                "name": "Air quality readings with default FOI",
                "Thing": { "@iot.id": 1 },
                "ObservedProperty": { "@iot.id": 1 },
                "Sensor": { "@iot.id": 1 },
                "FeatureOfInterest": { "@iot.id": 2 }
            };
            const infos = {
                api: `{post} ${entity.name} Post with default FOI`,
                apiName: `Post${entity.name}FOI`,
                apiDescription: `Post a new ${entity.name} with default FOI`,
                apiReference: "",
                apiExample: {
                    http: `/${testVersion}/${entity.name}`,
                    curl: defaultPost("curl", "KEYHTTP", datas),
                    javascript: defaultPost("javascript", "KEYHTTP", datas),
                    python: defaultPost("python", "KEYHTTP", datas)
                },
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
                .post(`/test/${testVersion}/Datastreams`)
                .send({})
                .set("Cookie", `${keyTokenName}=${token}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(400);
                    res.type.should.equal("application/json");
                    myError = JSON.stringify(res.body, null, 4);
                    docs[docs.length - 1].apiErrorExample = myError;
                    done();
                });
        });

        it(`Return added ${entity.name} from Thing`, (done) => {
            const datas = {
                "name": "Air Temperature DS [6]",
                "description": "Datastream for recording temperature [6]",
                "unitOfMeasurement": {
                    "name": `Degree Celsius ${getNB("unitOfMeasurement")}`,
                    "symbol": "degC",
                    "definition": "http://www.qudt.org/qudt/owl/1.0.0/unit/Instances.html#DegreeCelsius"
                },
                "ObservedProperty": {
                    "name": `Area Temperature ${getNB("unitOfMeasurement")}`,
                    "description": "The degree or intensity of heat present in the area",
                    "definition": "http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html#AreaTemperature"
                },
                "Sensor": {  
                    "name": `DHT22 ${getNB("unitOfMeasurement")}`,
                    "description": "DHT22 temperature sensor [1]",
                    "encodingType": "application/pdf",
                    "metadata": "https://cdn-shop.adafruit.com/datasheets/DHT22.pdf"
                }
            };
            const infos = {
                api: `{post} ${entity.name} Post with a Thing`,
                apiName: `PostLocationThing${entity.name}`,
                apiDescription: "POST a new Datastream with existing Thing.",
                apiReference: "https://docs.ogc.org/is/18-088/18-088.html#link-existing-entities-when-creating",
                apiExample: {
                    http: `/${testVersion}/Things(1)/${entity.name}`,
                    curl: defaultPost("curl", "KEYHTTP", datas),
                    javascript: defaultPost("javascript", "KEYHTTP", datas),
                    python: defaultPost("python", "KEYHTTP", datas)
                },
                apiParamExample: datas
            };
            chai.request(server)
                .post(`/test${infos.apiExample.http}`)
                .send(infos.apiParamExample)
                .set("Cookie", `${keyTokenName}=${token}`)
                .end(async (err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(201);
                    res.type.should.equal("application/json");
                    res.body.should.include.keys(testsKeys);
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    docs[docs.length - 1].apiErrorExample = myError;

                    done();
                });
        });

        it(`Return added ${entity.name} from Thing`, (done) => {
            const datas = {
                "name": "Capteur de pression [70b3d5e75e014f06]",
                "description": "Capteur de pression",
                "observationType": "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement",
                "unitOfMeasurement": {
                    "name": "Pression",
                    "symbol": "B",
                    "definition": "http://www.qudt.org/qudt/owl/1.0.0/unit/Instances.html#DegreeCelsius"
                },
                "ObservedProperty": {
                    "name": "Capteur de pression de chez moi",
                    "description": "Capteur de pression de biere",
                    "definition": "http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html#AreaTemperature"
                },
                "Sensor": {  
                    "name": "`Capteur de pression",
                    "description": "Capteur de pression",
                    "encodingType": "application/pdf",
                    "metadata": "https://www.watteco.fr/download/fiche-technique-torano-lorawan/?wpdmdl=8460&refresh=6405aa1c76d491678092828"
                }                
            };
            chai.request(server)
                .post(`/test/${testVersion}/Things(1)/${entity.name}`)
                .send(datas)
                .set("Cookie", `${keyTokenName}=${token}`)
                .end(async (err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(201);
                    res.type.should.equal("application/json");
                    res.body.should.include.keys(testsKeys);
                    done();
                });
        });
    });

    describe(`{patch} ${entity.name} ${nbColorTitle}[10.3]`, () => {
        it(`Return updated ${entity.name} ${nbColor}[10.3.1]`, (done) => {
            executeQuery(last(entity.table, true)).then((result) => {
                    const datas = {
                        unitOfMeasurement: {
                            name: "Degrees Fahrenheit",
                            symbol: "degF",
                            definition: "http://www.qudt.org/qudt/owl/1.0.0/unit/Instances.html#DegreeFahrenheit"
                        },
                        description: "Water Temperature of Bow river"
                    };
                    const infos = {
                        api: `{patch} ${entity.name} Patch one`,
                        apiName: `Patch${entity.name}`,
                        apiDescription: `Patch a ${entity.singular}.${showHide(`Patch${entity.name}`, apiInfos["10.3"])}`,
                        apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_request_2",
                        apiExample: {
                            http: `/${testVersion}/${entity.name}(10)`,
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
                            newItems.description.should.not.eql(result["description"]);
                            addToApiDoc({ ...infos, result: limitResult(res) });
                            done();
                        });
                });
        });

        it(`Return Error if the ${entity.name} not exist`, (done) => {
            chai.request(server)
                .patch(`/test/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`)
                .send({
                    unitOfMeasurement: {
                        symbol: "ºC",
                        name: "Celsius",
                        definition: "http://unitsofmeasure.org/ucum.html"
                    },
                    observationType: "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement",
                    description: "Temp readings",
                    name: "temp_readings"
                })
                .set("Cookie", `${keyTokenName}=${token}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(404);
                    res.type.should.equal("application/json");
                    // the JSON response body should have a

                    docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4);
                    done();
                });
        });
    });

    describe(`{delete} ${entity.name} ${nbColorTitle}[10.4]`, () => {
        it(`Delete ${entity.name} return no content with code 204 ${nbColor}[10.4.1]`, (done) => {
            executeQuery(`SELECT (SELECT count(id) FROM "${entity.table}")::int as count, (${last(entity.table)})::int as id `).then((beforeDelete) => {                    
                    const infos = {
                        api: `{delete} ${entity.name} Delete one`,
                        apiName: `Delete${entity.name}`,
                        apiDescription: `Delete a ${entity.singular}.${showHide(`Delete${entity.name}`, apiInfos["10.4"])}`,
                        apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_request_3",
                        apiExample: {
                            http: `/${testVersion}/${entity.name}(${beforeDelete["id"]})`,
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
                            executeQuery(`SELECT count(id)::int FROM "${entity.table}"`).then((afterDelete) => {                                 
                                afterDelete["count"].should.eql(beforeDelete["count"] - 1);
                                    addToApiDoc({ ...infos, result: limitResult(res) });
                                    done();
                                });
                        });
                });
        });

        it(`Return Error if the ${entity.name} not exist`, (done) => {
            chai.request(server)
                .delete(`/test/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`)
                .set("Cookie", `${keyTokenName}=${token}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(404);
                    res.type.should.equal("application/json");
                    docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4).replace(Number.MAX_SAFE_INTEGER.toString(), "1");
                    generateApiDoc(docs, `apiDoc${entity.name}.js`);
                    
                    done();
                });
        });
    });
});
