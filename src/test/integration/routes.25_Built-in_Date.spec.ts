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
    docs.push(prepareToApiDoc(input, "BuiltInDate"));
};

addToApiDoc({
    api: `{infos} /BuiltInDate Infos`,
    apiName: "InfosBuiltInDate",
    apiDescription: `The OGC SensorThings API supports a set of functions that can be used with the $filter or $orderby query operations. The following table lists the available functions and they follows the OData Canonical function definitions listed in Section 5.1.1.4 of the [OData Version 4.0 Part 2: URL Conventions] and the syntax rules for these functions are defined in [OData Version 4.0 ABNF].`,
          apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
    result: ""
});
   
describe("Odata BuiltInDates [9.3.3.5.2]", () => {
    it("search by resultTime eq 2017-01-13", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations Year",
            url: `/${testVersion}/Observations?$filter=resultTime eq 2017-01-13`,
            apiName: "BuiltInDateSearch",
            apiDescription: "Stean have a multitude date an",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
            apiExample: { http: "/test",
                            curl: defaultGet("curl", "KEYHTTP"),
                            javascript: defaultGet("javascript", "KEYHTTP"),
                            python: defaultGet("python", "KEYHTTP") 
                        }
        };
        chai.request(server)
            .get(`/test${infos.url}`)
            .end((err: Error, res: any) => {
                addStartNewTest("Built in Dates");
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body.value.length.should.eql(2);
                res.body["value"][0]["@iot.id"].should.eql(530);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("search by resultTime eq 13-01-2017", (done) => {
        const infos: Iinfos = {
            api: `{get} search by resultTime eq 01-13-2017`,
            url: `/${testVersion}/Observations?$filter=resultTime eq '13-01-2017'`,
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
                res.body["value"][0]["@iot.id"].should.eql(530);
                addGetTest(infos);
                done();
            });
    });

    it("search by resultTime gt 13-01-2017", (done) => {
        const infos: Iinfos = {
            api: `{get} search by resultTime gt 13-01-2017`,
            url: `/${testVersion}/Observations?$filter=resultTime gt '13-01-2017'`,
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
                res.body.value.length.should.eql(528);
                res.body["value"][0]["@iot.id"].should.eql(525);
                addGetTest(infos);
                done();
            });
    });

    it("search by resultTime lt 15-10-2021", (done) => {
        const infos: Iinfos = {
            api: `{get} search by resultTime lt 15-10-2021`,
            url: `/${testVersion}/Observations?$filter=resultTime lt '15-10-2021'`,
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
                res.body.value.length.should.eql(8);
                res.body["value"][0]["@iot.id"].should.eql(530);
                addGetTest(infos);
                done();
            });
    });    

    it("year(resultTime) eq 2017", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations Year",
            url: `/${testVersion}/Observations?$filter=year(resultTime) eq 2017`,
            apiName: "BuiltInDateYear",
            apiDescription: "The year function returns the year component of the Date or DateTimeOffset parameter value, evaluated in the time zone of the DateTimeOffset parameter value.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
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
                res.body.value.length.should.eql(8);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("month(resultTime) eq 10", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations Month",
            url: `/${testVersion}/Observations?$filter=month(resultTime) eq 10`,
            apiName: "BuiltInDateMonth",
            apiDescription: "The month function returns the month component of the Date or DateTimeOffset parameter value, evaluated in the time zone of the DateTimeOffset parameter value.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
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
                res.body.value.length.should.eql(202);
                res.body["value"][0]["@iot.id"].should.eql(559);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("day(resultTime) eq 11", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations Day",
            url: `/${testVersion}/Observations?$filter=day(resultTime) eq 11`,
            apiName: "BuiltInDateDay",
            apiDescription: "The day function returns the day component Date or DateTimeOffset parameter value, evaluated in the time zone of the DateTimeOffset parameter value.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
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
                res.body.value.length.should.eql(40);
                res.body["value"][0]["@iot.id"].should.eql(11);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("hour(resultTime) eq 12", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations Hour",
            url: `/${testVersion}/Observations?$filter=hour(resultTime) eq 12`,
            apiName: "BuiltInDateHour",
            apiDescription: "The hour function returns the hour component of the DateTimeOffset or TimeOfDay parameter value, evaluated in the time zone of the DateTimeOffset parameter value.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
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
                res.body.value.length.should.eql(16);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("minute(resultTime) eq 50", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations minute",
            url: `/${testVersion}/Observations?$filter=minute(resultTime) eq 50`,
            apiName: "BuiltInDateMinute",
            apiDescription: "The minute function returns the minute component of the DateTimeOffset or TimeOfDay parameter value, evaluated in the time zone of the DateTimeOffset parameter value.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
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
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("second(resultTime) ge 40", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations second",
            url: `/${testVersion}/Observations?$filter=second(resultTime) ge 40`,
            apiName: "BuiltInDateSecond",
            apiDescription: "The second function returns the second component (without the fractional part) of the DateTimeOffset or TimeOfDay parameter value.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
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
                res.body.value.length.should.eql(125);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("date(resultTime) eq date(validTime)", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations date",
            url: `/${testVersion}/Observations?$filter=date(resultTime) eq date(phenomenonTime)`,
            apiName: "BuiltInDateDate",
            apiDescription: "The date function returns the date part of the DateTimeOffset parameter value, evaluated in the time zone of the DateTimeOffset parameter value.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
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
                res.body.value.length.should.eql(530);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    it("time(resultTime) ne time(phenomenonTime)", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations time",
            url: `/${testVersion}/Observations?$filter=time(resultTime) ne time(phenomenonTime)`,
            apiName: "BuiltInDateTime",
            apiDescription: "The time function returns the time part of the DateTimeOffset parameter value, evaluated in the time zone of the DateTimeOffset parameter value.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
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
                res.body.value.length.should.eql(4);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    // it("totaloffsetminutes(resultTime) eq 330", (done) => {
    //     const infos:Iinfos  = {
    //         api: "{get} Observations Now",
    //         apiName: "BuiltInDateTotaloffsetminutes",
    //         apiDescription: "The totaloffsetminutes function returns the signed number of minutes in the time zone offset part of the DateTimeOffset parameter value, evaluated in the time zone of the DateTimeOffset parameter value.",
    //         apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
    //         apiExample: { http: "/test",
    //            url: `/${testVersion}/Observations?$filter=totaloffsetminutes(resultTime) eq 330",
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
    //             res.body.value.length.should.eql(52);
    //             res.body["value"][0]["@iot.id"].should.eql(1);
    //             addToApiDoc({ ...infos, result: limitResult(res) });
    //             addGetTest(infos);
    //            done();
    //         });
    // });      

    it("resultTime le now()", (done) => {
        const infos:Iinfos  = {
            api: "{get} Observations Now()",
            url: `/${testVersion}/Observations?$filter=resultTime le now()`,
            apiName: "BuiltInDateNow",
            apiDescription: "The now function returns the current point in time (date and time with time zone) as a DateTimeOffset value.",
            apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
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
                res.body.value.length.should.eql(530);
                addToApiDoc({ ...infos, result: limitResult(res) });
                addGetTest(infos);
                done();
            });
    });

    // it("fractionalseconds(resultTime) ne 0", (done) => {
    //     const infos:Iinfos  = {
    //         api: "{get} Observations fractionalseconds",
    //         apiName: "BuiltInDateFractionalseconds",
    //         apiDescription: "The fractionalseconds function returns the fractional seconds component of the DateTimeOffset or TimeOfDay parameter value as a non-negative decimal value less than 1.",
    //         apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
    //         apiExample: { http: "/test",
     //           url: `/${testVersion}/Observations?$filter=fractionalseconds(resultTime) ne 0",
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
    //             res.body.value.length.should.eql(52);
    //             res.body["value"][0]["@iot.id"].should.eql(1);
    //             addToApiDoc({ ...infos, result: limitResult(res) });
    //             addGetTest(infos);
    //            done();
    //         });
    // });

    // it("mindatetime(resultTime) ne 0", (done) => {
    //     const infos:Iinfos  = {
    //         api: "{get} Observations mindatetime",
    //         apiName: "BuiltInDateMindatetime",
    //         apiDescription: "The mindatetime function returns the earliest possible point in time as a DateTimeOffset value.",
    //         apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_built_in_query_functions",
    //         apiExample: { http: "/test",
     //           url: `/${testVersion}/Observations?$filter=resultTime gt mindatetime()",
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
    //             res.body.value.length.should.eql(52);
    //             res.body["value"][0]["@iot.id"].should.eql(1);
    //             addToApiDoc({ ...infos, result: limitResult(res) });
    //             addGetTest(infos);
     //           done();
    //         });
    // });  

    it("Save and write apiDoc", (done) => {
        generateApiDoc(docs, "apiDocBuiltInDate.js");
                done();
    });
});
