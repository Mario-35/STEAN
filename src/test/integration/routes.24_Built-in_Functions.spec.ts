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
import { IApiDoc, generateApiDoc, IApiInput, prepareToApiDoc, defaultGet, limitResult, testVersion, Iinfos } from "./constant";
import { server } from "../../server/index";
import { addGetTest, addStartNewTest } from "./tests";


chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];

const addToApiDoc = (input: IApiInput) => {
    docs.push(prepareToApiDoc(input, "BuiltInFunctions"));
};

addToApiDoc({
    api: `{infos} /BuiltInFunctions Infos`,
    apiName: "InfosBuiltInFunctions",
    apiDescription: `The OGC SensorThings API supports a set of functions that can be used with the $filter or $orderby query operations. The following table lists the available functions and they follows the OData Canonical function definitions listed in Section 5.1.1.4 of the [OData Version 4.0 Part 2: URL Conventions] and the syntax rules for these functions are defined in [OData Version 4.0 ABNF].`,
          apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
    result: ""
});
   
describe("Odata BuiltInFunctions [9.3.3.5.2]", () => {
    it("substringof('name', 'chamber') eq true ", (done) => {
        const infos:Iinfos  = {
            api: "{get} Things(:id) substringof",
            url: `/${testVersion}/Things?$filter=substringof('description', 'chamber') eq true`,
            apiName: "BuiltInFunctionsSubstringof",
            apiDescription: "This string function filters all the records that contain with string in property.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
                            curl: defaultGet("curl", "KEYHTTP"),
                            javascript: defaultGet("javascript", "KEYHTTP"),
                            python: defaultGet("python", "KEYHTTP") 
                        }
        };
        chai.request(server)
            .get(`/test${infos.url}`)
            .end((err: Error, res: any) => {
                addStartNewTest("Built in Functions");
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(1);
                res.body["value"][0]["@iot.id"].should.eql(6);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("substringof('name', 'with')", (done) => {
        const infos: Iinfos = {
            api: `{get} substringof('name', 'with')`,
            url: `/${testVersion}/Things?$filter=substringof('name', 'with')`,
            apiName: "",
            apiDescription: "",
            apiReference: ""
        };
        chai.request(server)
            .get(`/test${infos.url}`)
            .end((err: Error, res: any) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(3);
                res.body["value"][0]["@iot.id"].should.eql(13);
                addGetTest(infos);
                done();
            });
    });

    it("endwith('name', 'Thing') eq true", (done) => {
        const infos:Iinfos  = {
            api: "{get} Things(:id) endwith",
            url: `/${testVersion}/Things?$filter=endswith('name', 'Thing') eq true`,
            apiName: "BuiltInFunctionsEndwith",
            apiDescription: "This string function filters all the records that column name ends with the string in the property.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
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
                res.body.value.length.should.eql(5);
                res.body["value"][0]["@iot.id"].should.eql(1);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("endwith('description', 'one')", (done) => {
        const infos: Iinfos = {
            api: `{get} endwith('description', 'one')`,
            url: `/${testVersion}/Things?$filter=endswith('description', 'Thing')`,
            apiName: "",
            apiDescription: "",
            apiReference: ""
        };
        chai.request(server)
            .get(`/test${infos.url}`)
            .end((err: Error, res: any) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(6);
                res.body["value"][0]["@iot.id"].should.eql(1);
                addGetTest(infos);
                done();
            });
    });

    it("startswith('name', 'Temperature') eq true", (done) => {
        const infos:Iinfos  = {
            api: "{get} Things(:id) startswith",
            url: `/${testVersion}/Sensors?$filter=startswith('name', 'Hack') eq true`,
            apiName: "BuiltInFunctionsStartswith",
            apiDescription: "This string function filters all the records that starts with the string in the property.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
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
                res.body.value.length.should.eql(1);
                res.body["value"][0]["@iot.id"].should.eql(5);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("startswith('name', 'Temperature')", (done) => {
        const infos: Iinfos = {
            api: `{get} endwith(description, 'one')`,
            url: `/${testVersion}/Datastreams?$filter=startswith('name', 'Outlet')`,
            apiName: "",
            apiDescription: "",
            apiReference: ""
        };
        chai.request(server)
            .get(`/test${infos.url}`)
            .end((err: Error, res: any) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(2);
                res.body["value"][0]["@iot.id"].should.eql(9);
                addGetTest(infos);
                done();
            });
    });

    it("length(description) le 22", (done) => {
        const infos:Iinfos  = {
            api: "{get} Things(:id) Length",
            url: `/${testVersion}/Things?$filter=length(description) le 25`,
            apiName: "BuiltInFunctionsLength",
            apiDescription: "This string function return the length of the parameters to be test in filter.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
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
                res.body.value.length.should.eql(3);
                res.body["value"][0]["@iot.id"].should.eql(7);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("indexof('name', 'Temperature') eq 1", (done) => {
        const infos:Iinfos  = {
            api: "{get} indexof",
            url: `/${testVersion}/Things?$filter=indexof('name', 'Piezo') eq 1`,
            apiName: "BuiltInFunctionsIndexOf",
            apiDescription: "This string function return the index of the parameters in the column.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
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
                res.body.value.length.should.eql(2);
                res.body["value"][0]["@iot.id"].should.eql(9);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("substring('name', 1) eq 'ame of new Things 1'", (done) => {
        const infos:Iinfos  = {
            api: "{get} Things substring(str, nb)",
            url: `/${testVersion}/Things?$filter=substring('name', 1) eq 'hing with new Location test'`,
            apiName: "BuiltInFunctionsSubstringOne",
            apiDescription: "This string function filters all the records that contain with part of the string extract all characters from a particular position of a column name .",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
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
                res.body.value.length.should.eql(1);
                res.body["value"][0]["@iot.id"].should.eql(13);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });
    
    it("substring('description', 10, 6) eq 'outlet'", (done) => {
        const infos:Iinfos  = {
            api: "{get} Things substring(str, index, nb)",
            url: `/${testVersion}/Things?$filter=substring('description', 10, 6) eq 'outlet'`,
            apiName: "BuiltInFunctionsSubstringTwo",
            apiDescription: "This string function filters all the records that contain with part of the string extract by specific number of characters from a particular position of a column name .",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
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
                res.body.value.length.should.eql(2);
                res.body["value"][0]["@iot.id"].should.eql(7);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("tolower('name') eq 'sensorwebthing 2'", (done) => {
        const infos:Iinfos  = {
            api: "{get} Things toLower",
            url: `/${testVersion}/Things?$filter=tolower('name') eq 'piezo f5b'`,
            apiName: "BuiltInFunctionsTolower",
            apiDescription: "This string function return string whose characters are going to be converted to lowercase.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
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
                res.body.value.length.should.eql(1);
                res.body["value"][0]["@iot.id"].should.eql(9);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });
    
    it("toupper('name') eq 'PIEZOMETER F4'", (done) => {
        const infos:Iinfos  = {
            api: "{get} Things toUpper",
            url: `/${testVersion}/Things?$filter=toupper('name') eq 'PIEZOMETER F4'`,
            apiName: "BuiltInFunctionsToUpper",
            apiDescription: "This string function return string whose characters are going to be converted to uppercase.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
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
                res.body.value.length.should.eql(1);
                res.body["value"][0]["@iot.id"].should.eql(10);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("trim('name') eq 'Piezo F5b'", (done) => {
        const infos:Iinfos  = {
            api: "{get} Things trim",
            url: `/${testVersion}/Things?$filter=trim('name') eq 'Piezo F5b'`,
            apiName: "BuiltInFunctionsTrim",
            apiDescription: "This string function return string with removed spaces from both side from a string.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
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
                res.body.value.length.should.eql(1);
                res.body["value"][0]["@iot.id"].should.eql(9);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    // it("trim('name', 'Piezo ') eq '2'", (done) => {
    //     const infos:Iinfos  = {
    //         api: "{get} Things trimParams",
    //         url: `/${testVersion}/Things?$filter=trim('name', 'Piezo ') eq '2'`,
    //         apiName: "BuiltInFunctionsTrimWithParams",
    //         apiDescription: "This string function return string with removed spaces from both side from a string.",
    //         apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
    //         apiExample: { http: "/test",
    //                         curl: defaultGet("curl", "KEYHTTP"),
    //                         javascript: defaultGet("javascript", "KEYHTTP"),
    //                         python: defaultGet("python", "KEYHTTP") 
    //                     }
    //     };
    //     chai.request(server)
    //         .get(`/test${infos.url}`)
    //         .end((err: Error, res: any) => {
    //             should.not.exist(err);
    //             res.status.should.equal(200);
    //             res.type.should.equal("application/json");
    //             res.body.value.length.should.eql(1);
    //             res.body["value"][0]["@iot.id"].should.eql(2);
    //             addToApiDoc({ ...infos, result: limitResult(res) });
    //             addGetTest(infos);
    //             done();
    //         });
    // });

    it("concat('name', 'test') eq 'MultiDatastreams SensorWebThing 10test'", (done) => {
        const infos = {
            api: "{get} Things concat",
            url: `/${testVersion}/Things?$filter=concat('name', 'test') eq 'Piezometer F4test'`,
            apiName: "BuiltInFunctionsConcat",
            apiDescription: " 	The concat function returns a string that appends the second input parameter string value to the first.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_filter_operations",
            apiExample: { http: "/test",
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
                res.body.value.length.should.eql(1);
                res.body["value"][0]["@iot.id"].should.eql(10);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("Save and write apiDoc", (done) => {
        generateApiDoc(docs, "apiDocBuiltInFunctions.js");
        done();
    });
});
