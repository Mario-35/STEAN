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
import { IApiDoc, generateApiDoc, IApiInput, prepareToApiDoc, defaultGet, limitResult, apiInfos } from "./constant";
import { server } from "../../server/index";
import { dbTest } from "../dbTest";
import { testsKeys as things_testsKeys } from "./routes.04_things.spec";
import { testsKeys as datastreams_testsKeys } from "./routes.07_datastreams.spec";
import { testsKeys as sensors_testsKeys } from "./routes.09_sensors.spec";

chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];

const addToApiDoc = (input: IApiInput) => {
    docs.push(prepareToApiDoc(input, "Odata"));
};

addToApiDoc({
    api: `{infos} /Odata Infos`,
    apiName: "InfosOdata",
    apiDescription: `The use of query options allows refining the requests to help get the required information about the SensorThings entities in an easy and efficient manner. Each of the listed query options are available for each SensorThings entity, however the options for each may differ.<br>
        SensorThings query options can be categorized to two different groups.<br>
          -  The first group specifies the properties to be returned by the request. $expand and $select are query options of this group.<br>
          -  The second group is limiting, filtering, or re-ordering the request results. This group contains $orderby, $top, $skip, $count, and $filter`,
          apiReference: "http://docs.opengeospatial.org/is/15-078r6/15-078r6.html#19",
    result: ""
});
   
// http://docs.opengeospatial.org/is/15-078r6/15-078r6.html#25
describe("Odata", () => {

    it("Retrieve a specific thing and $expand Datastreams. [9.3.2.1]", (done) => {
        const infos = {
            api: "{get} Things(:id) Expand",
            apiName: "OdataExpand",
            apiDescription: `Use $expand query option to request inline information for related entities of the requested entity collection.${apiInfos["9.3.2.1"]}`,
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#expand",
            apiExample: { http: "/v1.0/Things(6)?$expand=Datastreams",
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
                res.body.should.include.keys(things_testsKeys.filter((elem) => elem !== "Datastreams@iot.navigationLink"));
                res.body.should.include.keys("Datastreams");
                res.body.Datastreams.length.should.eql(3);
                res.body.Datastreams[0].should.include.keys(datastreams_testsKeys);
                res.body["@iot.id"].should.eql(6);
                res.body.Datastreams[0] = [res.body.Datastreams[0][0], res.body.Datastreams[0][1], "..."];
                addToApiDoc({ ...infos, result: res });
                done();
            });
    });

    it("Retrieve a specific thing and $expand Datastreams and Sensor inside. [9.3.2.1]", (done) => {
        const infos = {
            api: "{get} Things(:id) Expand sub Entity",
            apiName: "OdataExpandSub",
            apiDescription: "$expand comma separated list of sub-entity names or sub-entity names separated by forward slash.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#expand",
            apiExample: { http: "/v1.0/Things(6)?$expand=Datastreams/Sensor",
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
                res.body.should.include.keys(things_testsKeys.filter((elem) => elem !== "Datastreams@iot.navigationLink"));
                res.body["@iot.id"].should.eql(6);
                res.body.should.include.keys("Datastreams");
                res.body.Datastreams.length.should.eql(3);
                res.body.Datastreams[0].should.include.keys("Sensor");
                res.body.Datastreams[0].Sensor.should.include.keys(sensors_testsKeys);
                res.body.Datastreams[1].should.include.keys("Sensor");
                res.body.Datastreams[1].Sensor.should.include.keys(sensors_testsKeys);
                res.body.Datastreams[0] = [res.body.Datastreams[0][0], res.body.Datastreams[0][1], "..."];
                addToApiDoc({ ...infos, result: res });
                done();
            });
    });

    it("Return void MultiDatastreams list in expand with no datas [9.3.2.1]", (done) => {
        const infos = {
            api: `{get} things(:id) expand with empty result`,
            apiName: `OdataExpandSubEmpty`,
            apiDescription: "Get list of locations and return list if is empty.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#expand",
            apiExample: {
                http: `/v1.0/Things(1)?$expand=MultiDatastreams`,
                curl: defaultGet("curl", "KEYHTTP"),
                javascript: defaultGet("javascript", "KEYHTTP"),
                python: defaultGet("python", "KEYHTTP") 
            }
        };
        chai.request(server)
            .get(`/test${infos.apiExample.http}`)
            .end((err: Error, res: any) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be text plain
                res.body.should.include.keys(things_testsKeys.filter((elem) => elem !== "MultiDatastreams@iot.navigationLink"));
                res.body.should.include.keys("MultiDatastreams");
                res.body.MultiDatastreams.length.should.eql(0);
                addToApiDoc({ ...infos, result: limitResult(res) });
                done();
            });
    });

    it("Return Datastreams with obvervation expand with filter result = 17.5 [9.3.2.1] & [9.3.2.2]", (done) => {
        const infos = {
            api: `{get} things(:id) expand with inner filter`,
            apiName: `OdataExpandWithFilter`,
            apiDescription: "Get datastream and expand obvervations with filter.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#expand",
            apiExample: {
                http: `/v1.0/Datastreams(2)?$expand=Observations($filter=result eq 17.5)`,
                curl: defaultGet("curl", "KEYHTTP"),
                javascript: defaultGet("javascript", "KEYHTTP"),
                python: defaultGet("python", "KEYHTTP") 
            }
        };
        chai.request(server)
            .get(`/test${infos.apiExample.http}`)
            .end((err: Error, res: any) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be text plain
                res.body.should.include.keys(datastreams_testsKeys.filter((elem) => elem !== "Observations@iot.navigationLink"));
                res.body.should.include.keys("Observations");
                res.body.Observations.length.should.eql(1);
                res.body.Observations[0]["@iot.id"].should.eql(7);
                addToApiDoc({ ...infos, result: limitResult(res) });
                done();
            });
    });

    it("Return Datastreams with obvervation expand complex select [9.3.2.1] & [9.3.2.2]", (done) => {
        const infos = {
            api: `{get} things(:id) expand with inner select`,
            apiName: `OdataExpandSelect`,
            apiDescription: "Get datastream and expand obvervations with complex select.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#expand",
            apiExample: {
                http: `/v1.0/Datastreams?$expand=Observations($select=phenomenonTime,result;$orderby=phenomenonTime desc;$top=10)`,
                curl: defaultGet("curl", "KEYHTTP"),
                javascript: defaultGet("javascript", "KEYHTTP"),
                python: defaultGet("python", "KEYHTTP") 
            }
        };
        chai.request(server)
            .get(`/test${infos.apiExample.http}`)
            .end((err: Error, res: any) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be text plain
                res.body.value[0].should.include.keys(datastreams_testsKeys.filter((elem) => elem !== "Observations@iot.navigationLink"));
                res.body.value[0].should.include.keys("Observations");
                res.body.value[0].Observations.length.should.eql(10);
                Object.keys(res.body.value[0].Observations[0]).length.should.eql(2);
                addToApiDoc({ ...infos, result: limitResult(res) });
                done();
            });
    });

    it("Retrieve description property for a specific Thing. [9.3.2.2]", (done) => {
        const infos = {
            api: "{get} Things(:id) Select",
            apiName: "OdataSelect",
            apiDescription: `Retrieve specified properties for a specific Things.${apiInfos["9.3.2.2"]}`,
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#select4",
            apiExample: { http: "/v1.0/Things(1)?$select=description",
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP") }
        };
        chai.request(server)
            .get(`/test${infos.apiExample.http}`)
            .end((err: Error, res: any) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.should.include.keys("description");
                addToApiDoc({ ...infos, result: limitResult(res) });
                done();
            });
    });

    it("Retrieve name and description properties from all Things. [9.3.2.2]", (done) => {
        const infos = {
            api: "{get} Things(:id) Select multi",
            apiName: "OdataSelectMulti",
            apiDescription: "Retrieve name and description for Things.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#select4",
            apiExample: { http: "/v1.0/Things?$select=name,description" ,
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP") }
        };
        dbTest("thing")
            .count()
            .then((result) => {
                const nb = Number(result[0]["count"]) > 200 ? 200 : Number(result[0]["count"]);
                chai.request(server)
                    .get(`/test${infos.apiExample.http}`)
                    .end((err, res) => {
                        should.not.exist(err);
                        res.status.should.equal(200);
                        res.type.should.equal("application/json");
                        res.body.value.length.should.eql(nb);
                        res.body.should.include.keys("@iot.count", "value");
                        res.body.value[0].should.include.keys("description", "name");
                        addToApiDoc({ ...infos, result: limitResult(res) });
                        done();
                    });
            });
    });

    it("Oata orderBy [9.3.3.1]", (done) => {
        const infos = {
            api: "{get} Things OrderBy",
            apiName: "OdataOrderBy",
            apiDescription: `Use $orderby query option to sort the response based on properties of requested entity in ascending (asc) or descending (desc) order.${apiInfos["9.3.3.1"]}`,
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#orderby",
            apiExample: { http: "/v1.0/Things?$orderby=name desc" ,
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP") }
        };
        dbTest("thing")
            .count()
            .then((result) => {
                const nb = Number(result[0]["count"]) > 200 ? 200 : Number(result[0]["count"]);
                chai.request(server)
                    .get(`/test${infos.apiExample.http}`)
                    .end((err, res) => {
                        should.not.exist(err);
                        res.status.should.equal(200);
                        res.type.should.equal("application/json");
                        res.body.value.length.should.eql(nb);
                        res.body.should.include.keys("@iot.count", "value");
                        res.body.value[0].should.include.keys("description", "name");
                        addToApiDoc({ ...infos, result: limitResult(res) });
                        done();
                    });
            });
    });

    it("Oata top [9.3.3.2]", (done) => {
        const infos = {
            api: "{get} Observations Top",
            apiName: "OdataTop",
            apiDescription: `Use $top query option to limit the number of requested entities.${apiInfos["9.3.3.2"]}`,
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#top",
            apiExample: { http: "/v1.0/Observations?$top=5" ,
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP") }
        };
        chai.request(server)
            .get(`/test${infos.apiExample.http}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(5);
                res.body.should.include.keys("@iot.count", "value");
                addToApiDoc({ ...infos, result: limitResult(res) });
                done();
            });
    });

    it("Oata skip [9.3.3.3]", (done) => {
        const infos = {
            api: "{get} Observations Skip",
            apiName: "OdataSkip",
            apiDescription: `Use $skip to specify the number of entities that should be skipped before returning the requested entities.${apiInfos["9.3.3.3"]}`,
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#skip",
            apiExample: { http: "/v1.0/Observations?$skip=3",
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP") }
        };
        dbTest("observation")
            .count()
            .then((result) => {
                const nb = Number(result[0]["count"]);
                chai.request(server)
                    .get(`/test${infos.apiExample.http}`)
                    .end((err, res) => {
                        should.not.exist(err);
                        res.status.should.equal(200);
                        res.type.should.equal("application/json");
                        res.body.value.length.should.eql(nb - 3);
                        res.body.should.include.keys("@iot.count", "value");
                        addToApiDoc({ ...infos, result: limitResult(res) });
                        done();
                    });
            });
    });

    it("Oata count [9.3.3.4]", (done) => {
            const infos = {
                api: "{get} Observations count",
                apiName: "OdataCountWithSkiTop",
                apiDescription: `Use count.${apiInfos["9.3.3.4"]}`,
                apiReference: "http://docs.opengeospatial.org/is/15-078r6/15-078r6.html#53",
                apiExample: { http: "/v1.0/Observations?$skip=3&$top=2&$count=true",
                curl: defaultGet("curl", "KEYHTTP"),
                javascript: defaultGet("javascript", "KEYHTTP"),
                python: defaultGet("python", "KEYHTTP") }
            };
    
            chai.request(server)
                .get(`/test${infos.apiExample.http}`)
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    res.body.value.length.should.eql(2);
                    res.body.should.include.keys("@iot.count", "value");
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    done();
                });
    });

    it("filter Datastreams whose unitOfMeasurement property name = 'Degrees Fahrenheit'.", (done) => {
        chai.request(server)
            .get(`/test/v1.0/Datastreams?$filter=unitOfMeasurement/name eq 'Degrees Fahrenheit'`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(1);
                res.body.should.include.keys("@iot.count", "value");
                res.body.value[0]["@iot.id"].should.eql(10);
                done();
            });
    });

    it("filter name OR description of thing", (done) => {
        chai.request(server)
            .get(`/test/v1.0/Things?$filter=name eq 'SensorWebThing 9' or description eq 'A New SensorWeb thing'`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(2);
                res.body.should.include.keys("@iot.count", "value");
                done();
            });
    });

    it("filter name AND description of thing", (done) => {
        chai.request(server)
            .get(`/test/v1.0/Things?$filter=name eq 'SensorWebThing 9' and description eq 'A SensorWeb thing Number nine'`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(1);
                res.body.should.include.keys("@iot.count", "value");
                done();
            });
    });

    it("filter name STARTWITH", (done) => {
        chai.request(server)
            .get(`/test/v1.0/Things?$filter=startswith(description,'A New')`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(1);
                res.body.should.include.keys("@iot.count", "value");
                done();
            });
    });

    it("filter name CONTAINS", (done) => {

        chai.request(server)
            .get(`/test/v1.0/Things?$filter=contains(description,'two')`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(2);
                res.body.should.include.keys("@iot.count", "value");
                done();
            });
    });

    it("filter date greater Than", (done) => {
        chai.request(server)
            .get(`/test/v1.0/Observations?$filter=phenomenonTime gt '2021-01-01'`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(26);
                res.body.should.include.keys("@iot.count", "value");
                done();
            });
    });

    it("filter date eq", (done) => {
        chai.request(server)
            .get(`/test/v1.0/Observations?$filter=result eq '92' and resultTime eq '2017-02-13'`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(1);
                res.body.value[0]["@iot.id"].should.eql(28);
                res.body.value[0]["result"].should.eql(92);
                res.body.should.include.keys("@iot.count", "value");
                done();
            });
    });

    it("filter date interval", (done) => {
        const infos = {
            api: "{get} Thing filter date greater than and less than",
            apiName: "OdataFilterDateGtAndLt",
            apiDescription: "Use filter gt with date",
            apiReference:"https://docs.ogc.org/is/18-088/18-088.html#requirement-request-data-filter",
            apiExample: { http: "/v1.0/Observations?$filter=phenomenonTime gt '2021-01-01' and phenomenonTime lt '2021-10-16'",
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP") }
        };

        chai.request(server)
            .get(`/test${infos.apiExample.http}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(25);
                res.body.should.include.keys("@iot.count", "value");
                addToApiDoc({ ...infos, result: limitResult(res) });
                done();
            });
    });

    it("Save and write apiDoc", (done) => {
        generateApiDoc(docs, "apiDocOdata.js");
        done();
    });
});
