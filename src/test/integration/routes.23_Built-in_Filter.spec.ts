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
import { IApiDoc, generateApiDoc, IApiInput, prepareToApiDoc, defaultGet, limitResult, apiInfos, testVersion, Iinfos } from "./constant";
import { server } from "../../server/index";
import { addGetTest, addStartNewTest } from "./tests";
chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];

const addToApiDoc = (input: IApiInput) => {
    docs.push(prepareToApiDoc(input, "BuiltInOperators"));
};

addToApiDoc({
    api: `{infos} /BuiltInOperators Infos`,
    apiName: "InfosBuiltInOperators",
    apiDescription: `The $filter system query option allows clients to filter a collection of entities that are addressed by a request URL. The expression specified with $filter is evaluated for each entity in the collection, and only items WHERE the expression evaluates to true SHALL be included in the response. Entities for which the expression evaluates to false or to null, or which reference properties that are unavailable due to permissions, SHALL be omitted from the response.${apiInfos["9.3.3.5.1"]}`,
    apiReference: "https://docs.ogc.org/is/18-088/18-088.html#requirement-request-data-filter",
    result: ""
});
   
// http://docs.opengeospatial.org/is/15-078r6/15-078r6.html#25
describe("Odata Built In Operators [9.3.3.5.1]", () => {
    it("Odata Built-in operator eq", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations eq",
            url: `/${testVersion}/Observations?$filter=result eq 310`,
            apiName: "BuiltInOperatorsEq",
            apiDescription: "Use eq for equal to =",
            apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP")}
        };
        chai.request(server)
        .get(`/test${infos.url}`)
        .end((err, res) => {
                addStartNewTest("Built in filter");
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(5);
                res.body.should.include.keys("@iot.count", "value");
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });


    // it("Odata Built-in operator eq null", (done) => {
    //     chai.request(server)
    //     .get(`/test/${testVersion}/Observations?$filter=result eq null")
    //     .end((err, res) => {
    //             should.not.exist(err);
    //             res.status.should.equal(200);
    //             res.type.should.equal("application/json");
    //             res.body.value.length.should.eql(3);
    //             res.body.should.include.keys("@iot.count", "value");
    //             addGetTest(infos);
    //            done();
    //         });
    // });


    it("Odata Built-in operator ne", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations ne",
            url: `/${testVersion}/Observations?$filter=result ne 45` ,
            apiName: "BuiltInOperatorsNe",
            apiDescription: "Use ne for not equal to <>",
            apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP") }
        };
        chai.request(server)
            .get(`/test${infos.url}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(530);
                res.body.should.include.keys("@iot.count", "value");
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("Odata Built-in operator gt", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations gt",
            url: `/${testVersion}/Observations?$filter=result gt 45`,
            apiName: "BuiltInOperatorsGt",
            apiDescription: "Use gt for greater than >",
            apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP") }
        };
        chai.request(server)
            .get(`/test${infos.url}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(335);
                res.body.should.include.keys("@iot.count", "value");
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("Odata Built-in operator gt AND lt", (done) => {
        const infos: Iinfos = {
            api: `{get} Odata Built-in operator gt AND lt`,
            url: `/${testVersion}/Observations?$filter=result gt 20 and result lt 22`,
            apiName: "",
            apiDescription: "",
            apiReference: ""
        };
        chai.request(server)
        .get(`/test${infos.url}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(142);
                res.body.should.include.keys("@iot.count", "value");
                addGetTest(infos);
                done();
            });
    });  
   
    it("Odata Built-in operator ge", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations ge",
            url: `/${testVersion}/Observations?$filter=result ge 45`,
            apiName: "BuiltInOperatorsGe",
            apiDescription: "Use gt for greater than or equal >=",
            apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP") }
        };
        chai.request(server)
            .get(`/test${infos.url}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(335);
                res.body.should.include.keys("@iot.count", "value");
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    }); 

    it("Odata Built-in operator lt", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations lt",
            url: `/${testVersion}/Observations?$filter=result lt 45`,
            apiName: "BuiltInOperatorsLt",
            apiDescription: "Use lt for smaller than <",
            apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP") }
        };
        chai.request(server)
            .get(`/test${infos.url}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(207);
                res.body.should.include.keys("@iot.count", "value");
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("Odata Built-in operator le", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations le",
            url: `/${testVersion}/Observations?$filter=result le 45`,
            apiName: "BuiltInOperatorsLe",
            apiDescription: "Use lt for Less than or equal <=",
            apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP") }
        };
        chai.request(server)
            .get(`/test${infos.url}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(207);
                res.body.should.include.keys("@iot.count", "value");
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("Odata Built-in operator and", (done) => {
        const infos:Iinfos  = {
            api: "{get} Thing and",
            url: `/${testVersion}/Things?$filter=name eq 'classic Thing' and description eq 'Description of classic Thing'`,
            apiName: "BuiltInOperatorsAnd",
            apiDescription: "Use filter with and",
            apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP") }
        };

        chai.request(server)
            .get(`/test${infos.url}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(1);
                res.body.should.include.keys("@iot.count", "value");
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("Odata Built-in operator or", (done) => {
        const infos:Iinfos  = {
            api: "{get} Thing or",
            url: `/${testVersion}/Things?$filter=name eq 'classic Thing' or description eq 'Description of Hack $debug=true Thing'`,
            apiName: "BuiltInOperatorsOr",
            apiDescription: "Use filter with or",
            apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
            curl: defaultGet("curl", "KEYHTTP"),
            javascript: defaultGet("javascript", "KEYHTTP"),
            python: defaultGet("python", "KEYHTTP") }
        };

        chai.request(server)
            .get(`/test${infos.url}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(1);
                res.body.should.include.keys("@iot.count", "value");
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    // it("filter name of thing", (done) => {
    //     const infos:Iinfos  = {
    //         api: "{get} Thing filter",
    //         apiName: "BuiltInOperatorsFilter",
    //         apiDescription: "Use simple filter",
    //         apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
    //         apiExample: { http: "/test",
    //            url: `/${testVersion}/Things?$filter=name eq 'SensorWebThing 9'",
    //         curl: defaultGet("curl", "KEYHTTP"),
    //         javascript: defaultGet("javascript", "KEYHTTP"),
    //         python: defaultGet("python", "KEYHTTP")  }
    //     };

    //     chai.request(server)
    //         .get(`/test${infos.url}`)
    //         .end((err, res) => {
    //             should.not.exist(err);
    //             res.status.should.equal(200);
    //             res.type.should.equal("application/json");
    //             res.body.value.length.should.eql(1);
    //             res.body.should.include.keys("@iot.count", "value");
    //             addToApiDoc({ ...infos, result: limitResult(res) });
    //             addGetTest(infos);
    //            done();
    //         });
    // });

    // it("filter Observations whose Datastream’s id is 1.", (done) => {
    //     const infos:Iinfos  = {
    //         api: "{get} Observations filter Datastream id 1",
    //         apiName: "BuiltInOperatorsFilterRelation",
    //         apiDescription: "Use filter with relation",
    //         apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
    //         apiExample: { http: "/test",
    //            url: `/${testVersion}/Observations?$filter=Datastream/id eq 3",
    //         curl: defaultGet("curl", "KEYHTTP"),
    //         javascript: defaultGet("javascript", "KEYHTTP"),
    //         python: defaultGet("python", "KEYHTTP")  }
    //     };

    //     chai.request(server)
    //         .get(`/test${infos.url}`)
    //         .end((err, res) => {
    //             should.not.exist(err);
    //             res.status.should.equal(200);
    //             res.type.should.equal("application/json");
    //             res.body.value.length.should.eql(2);
    //             res.body.should.include.keys("@iot.count", "value");
    //             addToApiDoc({ ...infos, result: limitResult(res) });
    //             addGetTest(infos);
     //           done();
    //         });
    // });

    // it("filter Datastreams whose unitOfMeasurement property name = 'Degrees Fahrenheit'.", (done) => {
    //     const infos:Iinfos  = {
    //         api: "{get} Thing filter",
    //         apiName: "BuiltInOperatorsFilterPropertyJson",
    //         apiDescription: "Use filter on json property",
    //         apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
    //         apiExample: { http: "/test",
    //            url: `/${testVersion}/Datastreams?$filter=unitOfMeasurement/name eq 'Degrees Fahrenheit'",
    //         curl: defaultGet("curl", "KEYHTTP"),
    //         javascript: defaultGet("javascript", "KEYHTTP"),
    //         python: defaultGet("python", "KEYHTTP")  }
    //     };

    //     chai.request(server)
    //         .get(`/test${infos.url}`)
    //         .end((err, res) => {
    //             should.not.exist(err);
    //             res.status.should.equal(200);
    //             res.type.should.equal("application/json");
    //             res.body.value.length.should.eql(1);
    //             res.body.should.include.keys("@iot.count", "value");
    //             res.body.value[0]["@iot.id"].should.eql(10);
    //             addToApiDoc({ ...infos, result: limitResult(res) });
    //             addGetTest(infos);
    //            done();
    //         });
    // });

    // it("filter name STARTWITH", (done) => {
    //     const infos:Iinfos  = {
    //         api: "{get} Thing filter startWith",
    //         apiName: "BuiltInOperatorsFilterStartWith",
    //         apiDescription: "Use filter startswith",
    //         apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
    //         apiExample: { http: "/test",
    //            url: `/${testVersion}/Things?$filter=startswith(description,'A New')",
    //         curl: defaultGet("curl", "KEYHTTP"),
    //         javascript: defaultGet("javascript", "KEYHTTP"),
    //         python: defaultGet("python", "KEYHTTP")  }
    //     };

    //     chai.request(server)
    //         .get(`/test${infos.url}`)
    //         .end((err, res) => {
    //             should.not.exist(err);
    //             res.status.should.equal(200);
    //             res.type.should.equal("application/json");
    //             res.body.value.length.should.eql(1);
    //             res.body.should.include.keys("@iot.count", "value");
    //             addToApiDoc({ ...infos, result: limitResult(res) });
    //             addGetTest(infos);
    //            done();
    //         });
    // });

    // it("filter name CONTAINS", (done) => {
    //     const infos:Iinfos  = {
    //         api: "{get} Thing filter contains",
    //         apiName: "BuiltInOperatorsFilterContains",
    //         apiDescription: "Use filter contains",
    //         apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
    //         apiExample: { http: "/test",
    //            url: `/${testVersion}/Things?$filter=contains(description,'two')",
    //         curl: defaultGet("curl", "KEYHTTP"),
    //         javascript: defaultGet("javascript", "KEYHTTP"),
    //         python: defaultGet("python", "KEYHTTP")  }
    //     };

    //     chai.request(server)
    //         .get(`/test${infos.url}`)
    //         .end((err, res) => {
    //             should.not.exist(err);
    //             res.status.should.equal(200);
    //             res.type.should.equal("application/json");
    //             res.body.value.length.should.eql(2);
    //             res.body.should.include.keys("@iot.count", "value");
    //             addToApiDoc({ ...infos, result: limitResult(res) });
    //             addGetTest(infos);
    //            done();
    //         });
    // });

    // it("filter date greater Than", (done) => {
    //     const infos:Iinfos  = {
    //         api: "{get} Thing filter date greater than",
    //         apiName: "BuiltInOperatorsFilterDateGt",
    //         apiDescription: "Use filter gt with date",
    //         apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
    //         apiExample: { http: "/test",
    //            url: `/${testVersion}/Observations?$filter=phenomenonTime gt '2021-01-01'" ,
    //         curl: defaultGet("curl", "KEYHTTP"),
    //         javascript: defaultGet("javascript", "KEYHTTP"),
    //         python: defaultGet("python", "KEYHTTP") }
    //     };

    //     chai.request(server)
    //         .get(`/test${infos.url}`)
    //         .end((err, res) => {
    //             should.not.exist(err);
    //             res.status.should.equal(200);
    //             res.type.should.equal("application/json");
    //             res.body.value.length.should.eql(2);
    //             res.body.should.include.keys("@iot.count", "value");
    //             addToApiDoc({ ...infos, result: limitResult(res) });
    //             addGetTest(infos);
    //            done();
    //         });
    // });

    // it("filter date eq", (done) => {
    //     const infos:Iinfos  = {
    //         api: "{get} Thing filter date equal (1 day)",
    //         apiName: "BuiltInOperatorsFilterDateEq",
    //         apiDescription: "Use filter eq with date",
    //         apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
    //         apiExample: { http: "/test",
    //            url: `/${testVersion}/Observations?$filter=result eq '92' and resultTime eq '2017-02-13'",
    //         curl: defaultGet("curl", "KEYHTTP"),
    //         javascript: defaultGet("javascript", "KEYHTTP"),
    //         python: defaultGet("python", "KEYHTTP")  }
    //     };

    //     chai.request(server)
    //         .get(`/test${infos.url}`)
    //         .end((err, res) => {
    //             should.not.exist(err);
    //             res.status.should.equal(200);
    //             res.type.should.equal("application/json");
    //             res.body.value.length.should.eql(1);
    //             res.body.value[0]["@iot.id"].should.eql(28);
    //             res.body.value[0]["result"].should.eql(92);
    //             res.body.value[0]["resultTime"].should.contains("2017-02-13");
    //             res.body.should.include.keys("@iot.count", "value");
    //             addToApiDoc({ ...infos, result: limitResult(res) });
    //             addGetTest(infos);
     //           done();
    //         });
    // });

    // it("filter date interval", (done) => {
    //     const infos:Iinfos  = {
    //         api: "{get} Thing filter date greater than and less than",
    //         apiName: "BuiltInOperatorsFilterDateGtAndLt",
    //         apiDescription: "Use filter gt with date",
    //         apiReference:"https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
    //         apiExample: { http: "/test",
     //           url: `/${testVersion}/Observations?$filter=phenomenonTime gt '2021-01-01' and phenomenonTime lt '2021-10-16'",
    //         curl: defaultGet("curl", "KEYHTTP"),
    //         javascript: defaultGet("javascript", "KEYHTTP"),
    //         python: defaultGet("python", "KEYHTTP")  }
    //     };

    //     chai.request(server)
    //         .get(`/test${infos.url}`)
    //         .end((err, res) => {
    //             should.not.exist(err);
    //             res.status.should.equal(200);
    //             res.type.should.equal("application/json");
    //             res.body.value.length.should.eql(1);
    //             res.body.should.include.keys("@iot.count", "value");
    //             addToApiDoc({ ...infos, result: limitResult(res) });
    //             addGetTest(infos);
    //            done();
    //         });
    // });

    it("Save and write apiDoc", (done) => {
        generateApiDoc(docs, "apiBuiltInOperators.js");
        done();
    });
});
