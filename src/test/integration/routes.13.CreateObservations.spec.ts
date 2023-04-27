/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TDD for ultime tests API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
process.env.NODE_ENV = "test";

import chai from "chai";
import chaiHttp from "chai-http";
import { IApiDoc, IApiInput, prepareToApiDoc, generateApiDoc, identification, keyTokenName, defaultPost, limitResult, blank } from "./constant";

import { server } from "../../server/index";

chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];


const addToApiDoc = (input: IApiInput) => {
    docs.push(prepareToApiDoc(input, "CreateObservations"));
};

addToApiDoc({
    api: `{infos} /CreateObservations Infos.`,
    apiName: "InfosCreateObservations",
    apiDescription: `Besides creating Observation entities one by one with multiple HTTP POST requests, there is a need to create multiple Observation entities with a lighter message body in a single HTTP request. In this case, a sensing system can buffer multiple Observations and send them to a SensorThings service in one HTTP request. Here we propose an Action operation CreateObservations.
    ${blank(1)}The message body aggregates Observations by Datastreams, which means all the Observations linked to one Datastream SHALL be aggregated in one JSON object. The parameters of each JSON object are shown in the following table.
    ${blank(2)}As an Observation links to one FeatureOfInterest, to establish the link between an Observation and a FeatureOfInterest, users should include the FeatureOfInterest ids in the dataArray. If no FeatureOfInterest id presented, the FeatureOfInterest will be created based on the Location entities of the linked Thing entity by default.
    <table> <thead> <tr> <th style="width: 10%">Name</th> <th style="width: 60%">Definition</th> <th style="width: 15%">Data type</th> <th style="width: 15%">Multiplicity and use</th> </tr> </thead> <tbody> <tr> <td>Datastream or MultiDatastream</td> <td><p>The unique identifier of the Datastream or MultiDatastream linking to the group of Observation entities in the dataArray.</p></td> <td><p>The unique identifier of a Datastream or MultiDatastream</p></td> <td>One (mandatory)</td> </tr> <tr> <td>components</td> <td><p>An ordered array of Observation property names whose matched values are included in the dataArray. At least the phenomenonTime and result properties SHALL be included. To establish the link between an Observation and a FeatureOfInterest, the component name is "FeatureOfInterest/id" and the FeatureOfInterest ids should be included in the dataArray array. If no FeatureOfInterest id is presented, the FeatureOfInterest will be created based on the Location entities of the linked Thing entity by default.</p></td> <td><p>An ordered array of Observation property names</p></td> <td>One (mandatory)</td> </tr> <tr> <td>dataArray</td> <td><p>A JSON Array containing Observations. Each Observation is represented by the ordered property values. The ordered property values match with the ordered property names in components.</p></td> <td>JSON Array</td> <td>One (mandatory)</td> </tr> </tbody> </table>`,
    apiReference: "https://docs.ogc.org/is/18-088/18-088.html#create-observation-dataarray",
    result: ""
});

const datasObs = (datastream: number) => {
    return {"Datastream": { "@iot.id": datastream },
    "components": ["phenomenonTime", "result", "resultTime", "FeatureOfInterest/id"],
    "dataArray@iot.count": 4,
    "dataArray": [
        ["2017-01-13T10:20:00.000Z", 90, "2017-01-13T10:20:00.000Z", 1],
        ["2017-01-13T10:21:00.000Z", 91, "2017-01-13T10:21:00.000Z", 1],
        ["2017-02-13T10:22:00.000Z", 92, "2017-02-13T10:22:00.000Z", 1],
        ["2017-02-13T10:22:00.000Z", 93, "2017-02-13T10:22:00.000Z", 1]
    ]
    };
};

const muliDatasObs = (multiDatastream: number) => {
    return {"MultiDatastream": { "@iot.id": multiDatastream },
        "components": ["phenomenonTime", "result", "resultTime", "FeatureOfInterest/id"],
        "dataArray@iot.count": 4,
        "dataArray": [
        [
            "2017-01-13T10:20:00.000Z",
            [
            591,
            592,
            593
            ],
            "2017-01-13T10:20:00.000Z",
            1
        ],
        [
            "2017-01-13T10:21:00.000Z",
            [
            691,
            692,
            693
            ],
            "2017-01-13T10:21:00.000Z",
            1
        ],
        [
            "2017-02-13T10:22:00.000Z",
            [
            791,
            792,
            793
            ],
            "2017-02-13T10:22:00.000Z",
            1
        ],
        [
            "2017-02-13T10:22:00.000Z",
            [
            891,
            892,
            893
            ],
            "2017-02-13T10:22:00.000Z",
            1
        ]
        ]
    };
};

describe("endpoint : Create Observations [13.2]", () => {
    let token = "";

    before((done) => {
        
        chai.request(server)
            .post("/test/v1.0/login")
            .send(identification)
            .end((err: Error, res: any) => {
                token = String(res.body["token"]);
                done();
            });
    });

    it("should return 4 observations links added that was added", (done) => {
        const infos = {
            api: `{post} CreateObservations Add datastream`,
            apiName: "PostCreateObservationsDatastream",
            apiDescription: "Create Observations with CreateObservations",
            apiExample: {
                http: "/v1.0/CreateObservations",
                curl: defaultPost("curl", "KEYHTTP", datasObs(1)),
                javascript: defaultPost("javascript", "KEYHTTP", datasObs(1)),
                python: defaultPost("python", "KEYHTTP", datasObs(1))
            },
            apiParamExample: datasObs(1)
        };

        chai.request(server)
            .post("/test/v1.0/CreateObservations")
            .send(infos.apiParamExample)
            .set("Cookie", `${keyTokenName}=${token}`)
            .end((err: Error, res: any) => {
                should.not.exist(err);
                res.status.should.equal(201);
                res.type.should.equal("application/json");
                res.body[0].should.include("/v1.0/Observations(");
                res.body[1].should.include("/v1.0/Observations(");
                res.body[2].should.include("/v1.0/Observations(");
                addToApiDoc({ ...infos, result: limitResult(res) });
                done();
            });
    });

    it("should throw an error if datastream does not exist", (done) => {
        chai.request(server)
            .post("/test/v1.0/CreateObservations")
            .send({
                "Datastream": { "@iot.id": `${BigInt(Number.MAX_SAFE_INTEGER)}` },
                "components": ["phenomenonTime", "result", "resultTime", "FeatureOfInterest/id"],
                "dataArray@iot.count": 3,
                "dataArray": [
                    ["2017-01-13T10:20:00.000Z", 90, "2017-01-13T10:20:00.000Z", 1],
                    ["2017-01-13T10:21:00.000Z", 91, "2017-01-13T10:21:00.000Z", 1],
                    ["2017-01-13T10:22:00.000Z", 92, "2017-01-13T10:22:00.000Z", 1]
                ]
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

    it("should return 4 observations in datastream 2", (done) => {
        chai.request(server)
            .post("/test/v1.0/CreateObservations")
            .send(datasObs(2))
            .set("Cookie", `${keyTokenName}=${token}`)
            .end((err: Error, res: any) => {                
                should.not.exist(err);
                res.status.should.equal(201);
                res.type.should.equal("application/json");
                res.body[0].should.include("/v1.0/Observations(");
                res.body[1].should.include("/v1.0/Observations(");
                res.body[2].should.include("/v1.0/Observations(");
                done();
            });
    });

    it("should return 4 observations duplicate", (done) => {
        const infos = {
            api: `{post} CreateObservations Add datastream duplicate.`,
            apiName: "PostCreateObservationsDatastreamDuplicate",
            apiDescription: "Create Observations duplicate with CreateObservations",
            apiExample: {
                http: "/v1.0/CreateObservations",
                curl: defaultPost("curl", "KEYHTTP", datasObs(2)),
                javascript: defaultPost("javascript", "KEYHTTP", datasObs(2)),
                python: defaultPost("python", "KEYHTTP", datasObs(2))
            },
            apiParamExample: datasObs(2)
        };
        
        chai.request(server)
        .post("/test/v1.0/CreateObservations")
        .send(datasObs(2))
        .set("Cookie", `${keyTokenName}=${token}`)
            .end((err: Error, res: any) => {
                should.not.exist(err);
                res.status.should.equal(201);
                res.type.should.equal("application/json");
                res.body.length.should.eql(4);
                // res.body[0].should.eql("Duplicate (2017-01-13T10:20:00.000Z,90,2017-01-13T10:20:00.000Z,1)");
                addToApiDoc({ ...infos, result: limitResult(res) });
                done();
            });
    });
        
    it("should return 4 observations duplicate = delete", (done) => {
        const datas = {
            "duplicate": "delete",
            ... datasObs(2)
        };
        const infos = {
            api: `{post} CreateObservations Add datastream duplicate = delete.`,
            apiName: "PostCreateObservationsDatastreamDuplicateDelete",
            apiDescription: "Create Observations duplicate delete with CreateObservations",
            apiExample: {
                http: "/v1.0/CreateObservations",
                curl: defaultPost("curl", "KEYHTTP", datas),
                javascript: defaultPost("javascript", "KEYHTTP", datas),
                python: defaultPost("python", "KEYHTTP", datas)
            },
            apiParamExample: datas
        };
        
        chai.request(server)
        .post("/test/v1.0/CreateObservations")
        .send(datas)
        .set("Cookie", `${keyTokenName}=${token}`)
        .end((err: Error, res: any) => {
            should.not.exist(err);
            res.status.should.equal(201);
            res.type.should.equal("application/json");
            res.body.length.should.eql(8);
            res.body[0].should.eql("Duplicate (2017-01-13T10:20:00.000Z,90,2017-01-13T10:20:00.000Z,1)");
            res.body[1].should.include("delete id ==>");
            addToApiDoc({ ...infos, result: limitResult(res) });
            done();
        });
    });

    it("should return 4 observations with multiDatastream", (done) => {
        const datas = muliDatasObs(2);
        const infos = {
            api: `{post} CreateObservations Add multiDatastream`,
            apiName: "PostCreateObservationsMultiDatastream",
            apiDescription: "Create Observations duplicate with CreateObservations",
            apiExample: {
                http: "/v1.0/CreateObservations",
                curl: defaultPost("curl", "KEYHTTP", datas),
                javascript: defaultPost("javascript", "KEYHTTP", datas),
                python: defaultPost("python", "KEYHTTP", datas)
            },
            apiParamExample: datas
        };
        
        chai.request(server)
        .post("/test/v1.0/CreateObservations")
        .send(datas)
        .set("Cookie", `${keyTokenName}=${token}`)
            .end((err: Error, res: any) => {
                should.not.exist(err);
                res.status.should.equal(201);
                res.type.should.equal("application/json");
                res.body.length.should.eql(4);
                res.body[0].should.include("/Observations(");
                addToApiDoc({ ...infos, result: limitResult(res) });
                done();
            });
    });

    it("should return 4 observations in MultiDatastream", (done) => {
        const datas = muliDatasObs(2);
        const infos = {
            api: `{post} CreateObservations Add multiDatastream duplicate.`,
            apiName: "PostCreateObservationsMultiDatastreamDuplicate",
            apiDescription: "Create Observations duplicate with CreateObservations",
            apiExample: {
                http: "/v1.0/CreateObservations",
                curl: defaultPost("curl", "KEYHTTP", datas),
                javascript: defaultPost("javascript", "KEYHTTP", datas),
                python: defaultPost("python", "KEYHTTP", datas)
            },
            apiParamExample: datas
        };
        
        chai.request(server)
        .post("/test/v1.0/CreateObservations")
        .send(datas)
        .set("Cookie", `${keyTokenName}=${token}`)
        .end((err: Error, res: any) => {
            should.not.exist(err);
            res.status.should.equal(201);
            res.type.should.equal("application/json");
            res.body.length.should.eql(4);
            res.body[0].should.eql("Duplicate (2017-01-13T10:20:00.000Z,591,592,593,2017-01-13T10:20:00.000Z,1)");
            addToApiDoc({ ...infos, result: limitResult(res) });
            done();
        });
    });

    it("should return 4 observations duplicate = delete", (done) => {
        const datas = {
            "duplicate": "delete",
            ... muliDatasObs(2)
        };
        const infos = {
            api: `{post} CreateObservations Add multiDatastream duplicate = delete.`,
            apiName: "PostCreateObservationsMultiDatastreamDuplicateDelete",
            apiDescription: "Create Observations duplicate delete with CreateObservations",
            apiExample: {
                http: "/v1.0/CreateObservations",
                curl: defaultPost("curl", "KEYHTTP", datas),
                javascript: defaultPost("javascript", "KEYHTTP", datas),
                python: defaultPost("python", "KEYHTTP", datas)
            },
            apiParamExample: datas
        };
        
        chai.request(server)
        .post("/test/v1.0/CreateObservations")
        .send(datas)
        .set("Cookie", `${keyTokenName}=${token}`)
        .end((err: Error, res: any) => {
            should.not.exist(err);
            res.status.should.equal(201);
            res.type.should.equal("application/json");
            res.body.length.should.eql(8);
            res.body[0].should.eql("Duplicate (2017-01-13T10:20:00.000Z,591,592,593,2017-01-13T10:20:00.000Z,1)");
            res.body[1].should.include("delete id ==>");
            addToApiDoc({ ...infos, result: limitResult(res) });
            generateApiDoc(docs, "CreateObservations.js");

            done();
        });
    });
        
});
    
