/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TDD for Lora API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
 process.env.NODE_ENV = "test";

 import chai from "chai";
 import chaiHttp from "chai-http";
 import { IApiDoc, generateApiDoc, IApiInput, prepareToApiDoc, identification, keyTokenName, defaultPost, getNB, limitResult, apiInfos, showHide, nbColor, nbColorTitle, testVersion, _RAWDB } from "./constant";
 import { server } from "../../server/index";
 import { Ientity } from "../../server/types";
 
 const testsKeys = [
     "@iot.id",
     "name",
     "deveui",
     "description",
     "properties",
     "@iot.selfLink",
     "Datastream@iot.navigationLink",
     "MultiDatastream@iot.navigationLink",
     "Decoder@iot.navigationLink"
 ];
 
 chai.use(chaiHttp);
 
 const should = chai.should();
 
 const docs: IApiDoc[] = [];
 const entity: Ientity = _RAWDB.Loras;
 // const entityObs: Ientity = _RAWDB.Observations;
 let firstLoraID = "";
 let firstLoraDEVEUI = ""; 
 
 const addToApiDoc = (input: IApiInput) => {
     docs.push(prepareToApiDoc(input, entity.name));
 };
 
 addToApiDoc({
     api: `{infos} ${entity.name} Infos.`,
     apiName: `Infos${entity.name}`,
     apiDescription:
         "Lora is an layer for add observations in sensorThings from LORA sensors, the link with sensor is done by deveui (the unique ID of lora sensor) in things properties",
     apiReference: "",
     result: ""
 });
 
 describe("endpoint : Lora", () => {
     const success: string[] = [];
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
                apiExample: { http: `/${testVersion}/${entity.name}` },
                apiSuccess: ["{number} id @iot.id", "{relation} selfLink @iot.selfLink", ...success]
             };
            chai.request(server)
                .get(`/test/${testVersion}/${entity.name}`)
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    // res.body.value.length.should.eql(4);
                    res.body.should.include.keys("@iot.count", "value");
                    res.body.value[0].should.include.keys(testsKeys);
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    firstLoraDEVEUI = res.body.value[0].deveui;
                    firstLoraID = res.body.value[0]["@iot.id"];
                    done();
                });
         });
 
         it("should respond with a single Lora [9.2.3]", (done) => {
             const infos = {
                 api: `{get} ${entity.name}(:id) Get one`,
                 apiName: `GetOne${entity.name}`,
                 apiDescription: "Get a specific Lora.",
                 apiReference: "https://docs.ogc.org/is/18-088/18-088.html#usage-address-entity",
                 apiExample: { http: `/${testVersion}/${entity.name}(${firstLoraDEVEUI})` }
             };
             chai.request(server)
                 .get(`/test${infos.apiExample.http}`)
                 .end((err: Error, res: any) => {
                     should.not.exist(err);
                     res.status.should.equal(200);
                     res.type.should.equal("application/json");
                     res.body["@iot.selfLink"].should.contain(`/Loras(${firstLoraID})`);
                     res.body["@iot.id"].should.eql(Number(firstLoraID));
                     addToApiDoc({ ...infos, result: limitResult(res) });
                     done();
                 });
         });
 
         it("should throw an error if the Lora does not exist", (done) => {
             chai.request(server)
                 .get(`/test/${testVersion}/${entity.name}(NOTHINGTOFOUND)`)
                 .end((err, res) => {
                     should.not.exist(err);
                     res.status.should.equal(404);
                     res.type.should.equal("application/json");
                     res.body["detail"].should.include("NOTHINGTOFOUND not found");
                     docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4);
                     done();
                 });
         });
     });
 
     describe(`{post} ${entity.name} ${nbColorTitle}[10.2]`, () => {
         it("should return the Lora Affected multi that was added", (done) => {
             const datas = {
                 "MultiDatastream": {
                     "@iot.id": 2
                 },
                 "Decoder": {
                     "@iot.id": 1
                 },
                 "name": `My new ${getNB(entity.name)}`,
                 "description": "My new Lora Description",
                 "deveui": "8cf9574000009L8C"
             };
             const infos = {
                 api: `{post} ${entity.name} Post MultiDatastream basic`,
                 apiName: `Post${entity.name}MultiDatastream`,
                 apiDescription: `Post a new ${entity.name}.${showHide(`Post${entity.name}`, apiInfos["10.2"])}`, apiExample: {
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
 
         it("should return the Lora Affected datastream that was added", (done) => {
             const datas = {
                 "Datastream": {
                     "@iot.id": 14
                 },
                 "Decoder": {
                     "@iot.id": 3
                 },
                 "name": "Lora for datastream",
                 "description": "My new Lora Description",
                 "deveui": "70b3d5e75e014f06"
             };
             const infos = {
                 api: `{post} ${entity.name} Post Datastream basic`,
                 apiName: `Post${entity.name}Datastream?$debug=true`,
                 apiDescription: `Post a new ${entity.name}.${showHide(`Post${entity.name}`, apiInfos["10.2"])}`, apiExample: {
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

         it("should return an error because datastream not exist", (done) => {
             chai.request(server)
                 .post(`/test/${testVersion}/${entity.name}`)
                 .send({
                    "Datastream": {
                        "@iot.id": 155
                    },
                    "Decoder": {
                        "@iot.id": 3
                    },
                    "name": "Lora for datastream",
                    "description": "My new Lora Description",
                    "deveui": "70b3d5e75e014f06"
                })
                 .set("Cookie", `${keyTokenName}=${token}`)
                 .end((err: Error, res: any) => {
                     should.not.exist(err);
                     res.status.should.equal(404);
                     res.body["detail"].should.contain('exist no datastream ID --> 155');
                     done();
                 });
         });
 
         it("should return the Lora observation that was added", (done) => {
             const datas = {
                 "deveui": "8CF9574000002D1D",
                 "timestamp": "2021-10-18T14:53:44+02:00",
                 "payload_ciphered": null,
                 "frame": "010610324200000107103E4900009808"
             };
             const infos = {
                 api: `{post} ${entity.name} Post observation basic`,
                 apiName: `Post${entity.name}Observation`,
                 apiDescription: `Post a new Observation in a Lora Thing.`,
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
                     res.body["@iot.selfLink"].should.contain("/Observations(");
                     res.body["result"][0].should.eql(18.75);
                     res.body["result"][1].should.eql(16.946);
                     addToApiDoc({ ...infos, result: limitResult(res) });
                     done();
                 });
         });
 
         it("should return Error decoder Message", (done) => {
            const datas = {
                "deveui": "8CF9574000002D1D",
                "timestamp": "2021-10-18T14:53:44+02:00",
                "payload_ciphered": null,
                "frame": "AA010610324200000107103E4900009808"
            };
            const infos = {
                api: `{post} ${entity.name} Post observation payload basic`,
                apiName: `Post${entity.name}ObservationError`,
                apiDescription: `Post a new Observation in a Lora Thing.`,
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
                    res.status.should.equal(400);
                    res.type.should.equal("application/json");
                    // res.body["detail"].should.eql('Decoding Payload error');
                    done();
                });
        });

         it("should return Error Invalid Payload Message", (done) => {
            const datas = {
                "deveui": "8CF9574000002D1D",
                "timestamp": "2021-10-18T14:53:44+02:00",
                "payload_ciphered": null,
                "frame": "AA010610324200000107103E4900009808"
            };
            const infos = {
                api: `{post} ${entity.name} Post basic`,
                apiName: `Post${entity.name}InvalidPayload`,
                apiDescription: `Post a new Observation in a Lora Thing.`,
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
                    res.status.should.equal(400);
                    res.type.should.equal("application/json");
                    res.body["detail"].should.eql('Invalid Payload');
                    done();
                });
        });

         it(`Return Error if the payload is malformed ${nbColor}[10.2.2]`, (done) => {
             chai.request(server)
                 .post(`/test/${testVersion}/${entity.name}`)
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
 
         it("should return that Observation already exist", (done) => {
             const datas = {
                "deveui": "8CF9574000002D1D",
                "timestamp": "2021-10-18T14:53:44+02:00",
                "payload_ciphered": null,
                "frame": "010610324200000107103E4900009808"
            };
             const infos = {
                 api: `{post} ${entity.name} Post Duplicate`,
                 apiName: `Post${entity.name}Duplicate`,
                 apiDescription: "Post a new Duplicate Lora Observation.",
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
                     res.status.should.equal(409);
                     res.type.should.equal("application/json");
                     res.body["detail"].should.eql("Observation already exist");
                     done();
                 });
         });
 
         it("should return the Observation that was added with Sort", (done) => {
             const datas = {
                "data": {
                  "Battery": 50,
                  "Temperature": 25,
                  "moisture": 100
                },
                "deveui": "8cf9574000002d4d",
                "sensor_id": "8cf9574000002d4d",
                "timestamp": "2021-10-15T14:53:44+02:00",
                "payload_ciphered": null
              };
             const infos = {
                 api: `{post} ${entity.name} Post Sort`,
                 apiName: `Post${entity.name}Sort`,
                 apiDescription: "Post a new Lora Observation Sorted.",
                 apiExample: {
                     http: `/${testVersion}/${entity.name}`,
                     curl: defaultPost("curl", "KEYHTTP", datas),
                     javascript: defaultPost("javascript", "KEYHTTP", datas),
                     python: defaultPost("python", "KEYHTTP", datas)
                 },
                 // apiParam: params,
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
                     res.body["@iot.selfLink"].should.contain("/Observations(");
                     res.body["result"][0].should.eql(100);
                     res.body["result"][1].should.eql(25);
                     res.body["result"][2].should.eql(50);
                     addToApiDoc({ ...infos, result: limitResult(res) });
                     done();
                 });
         });
 
         it("should return the Observation with data null", (done) => {
             const datas = {
                 "data": null,
                 "deveui": "8cf9574000002d4d",
                 "sensor_id": "8cf9574000002d4d",
                 "timestamp": "2021-10-15T14:53:44+02:00",
                 "payload_ciphered": null,
                 "payload_deciphered": ""
             };
             const infos = {
                 api: `{post} ${entity.name} Post Data Null`,
                 apiName: `Post${entity.name}Null`,
                 apiDescription: "Post a new Lora Observation With Data null.",
                 apiExample: {
                     http: `/${testVersion}/${entity.name}`,
                     curl: defaultPost("curl", "KEYHTTP", datas),
                     javascript: defaultPost("javascript", "KEYHTTP", datas),
                     python: defaultPost("python", "KEYHTTP", datas)
                 },
                 // apiParam: params,
                 apiParamExample: datas
             };
             chai.request(server)
                 .post(`/test${infos.apiExample.http}`)
                 .send(infos.apiParamExample)
                 .set("Cookie", `${keyTokenName}=${token}`)
                 .end((err: Error, res: any) => {
                     should.not.exist(err);
                     res.status.should.equal(400);
                     res.type.should.equal("application/json");
                     res.body["detail"].should.eql("Data is missing or Null");
                     done();
                 });
         });
 
         it("should return error that Data not corresponding", (done) => {
             const datas = {
                 "data": {
                     "lost": 50,
                     "nothing": 25,
                     "dontknow": 100
                 },
                 "deveui": "8cf9574000002d4d",
                 "sensor_id": "8cf9574000002d4d",
                 "timestamp": "2021-10-15T14:53:44+02:00",
                 "payload_ciphered": null,
                 "payload_deciphered": ""
             };
             const infos = {
                 api: `{post} ${entity.name} Post Data Nots`,
                 apiName: `Post${entity.name}DataNotCorrespond`,
                 apiDescription: "Post a new Lora Observation Data not corresponding.",
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
                     res.status.should.equal(400);
                     res.type.should.equal("application/json");
                     res.body["detail"].should.include("Data not corresponding");
                     generateApiDoc(docs, `apiDoc${entity.name}.js`);
                     
                     done();
                 });
         });
     });
 
     // describe(`{delete} ${entity.name} Delete.`, () => {
     //     it("should return no content with code 204", (done) => {
     //         dbTest("multidatastream")
     //             .whereRaw(whereLora())
     //             .then((items) => {
     //                 const thingObject = items[items.length - 1];
     //                 const myId = thingObject.deveui;
 
     //                 const lengthBeforeDelete = items.length;
     //                 const infos = {
     //                     api: `{delete} ${entity.name} Delete one`,
     //                     apiName: `Delete${entity.name}`,
     //                     apiDescription: "Delete an Lora Observation.",
     //                     apiExample: {
     //                         http: `/${testVersion}/${entity.name}(${myId})`,
     //                         curl: defaultDelete("curl", "KEYHTTP"),
     //                         javascript: defaultDelete("javascript", "KEYHTTP"),
     //                         python: defaultDelete("python", "KEYHTTP")
     //                     }
     //                 };
     //                 chai.request(server)
     //                     .delete(`/test${infos.apiExample.http}`)
     //                     .set("Cookie", `${keyTokenName}=${token}`)
     //                     .end((err: Error, res: any) => {
     //                         should.not.exist(err);
     //                         res.status.should.equal(204);
     //                         dbTest("multidatastream")
     //                             .whereRaw(whereLora())
     //                             .then((newItems) => {
     //                                 console.log(items);
 
     //                                 newItems.length.should.eql(lengthBeforeDelete - 1);
     //                                 addToApiDoc({ ...infos, result: limitRes(res) });
     //                                 done();
     //                             });
     //                     });
     //             });
     //     });
     //     it("should throw an error if the sensor does not exist", (done) => {
     //         chai.request(server)
     //             .delete(`/test/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`)
     //             .set("Cookie", `${keyTokenName}=${token}`)
     //             .end((err: Error, res: any) => {
     //                 should.not.exist(err);
     //                 res.status.should.equal(404);
     //                 res.type.should.equal("application/json");
     //                 docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4);
     //                 generateApiDoc(docs, `apiDoc${entity.name}.js`);
     //                 done();
     //             });
     //     });
     // });
 });
 