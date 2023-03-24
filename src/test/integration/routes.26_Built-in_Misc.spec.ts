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
import { IApiDoc, generateApiDoc, IApiInput, prepareToApiDoc, defaultGet, limitResult } from "./constant";
import { server } from "../../server/index";


chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];

const addToApiDoc = (input: IApiInput) => {
    docs.push(prepareToApiDoc(input, "BuiltInMisc"));
};

addToApiDoc({
    api: `{infos} /BuiltInMisc Infos`,
    apiName: "InfosBuiltInMisc",
    apiDescription: `Stean add some usefull function`,
    apiReference: "",
    result: ""
});
   
describe("Odata BuiltInMisc", () => {
    it("interval(1 hour)", (done) => {
        const infos = {
            api: "{get} Observations Interval",
            apiName: "BuiltInMiscInterval",
            apiDescription: "The interval keyword rounds the input postgresSql interval (see reference below) parameter to the nearest interval.",
            apiReference: "https://www.postgresql.org/docs/15/ecpg-pgtypes.html#ECPG-PGTYPES-INTERVAL",
            apiExample: {   http: "/v1.0/Datastreams(3)/Observations?$interval=1 hour",
                            curl: defaultGet("curl", "KEYHTTP"),
                            javascript: defaultGet("javascript", "KEYHTTP"),
                            python: defaultGet("python", "KEYHTTP") 
                        }
        };
        chai.request(server)
            .get(`/test${infos.apiExample.http}`)
            .end((err: any, res: any) => { 
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body["@iot.count"].should.eql("5");
                res.body.value.length.should.eql(5);
                res.body["value"][0]["@iot.id"].should.eql(3);
                res.body["value"][0]["phenomenonTime"].should.eql('2016-11-18T03:00:00');
                res.body["value"][1]["@iot.id"].should.eql(0);
                res.body["value"][1]["phenomenonTime"].should.eql('2016-11-18T04:00:00');
                addToApiDoc({ ...infos, result: limitResult(res) });
                done();
            });
    });

    it("interval(15 min)", (done) => {
        chai.request(server)
            .get(`/test/v1.0/Datastreams(3)/Observations?$interval=15 min`)
            .end((err: any, res: any) => { 
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body["@iot.count"].should.eql("17");
                res.body.value.length.should.eql(17);
                res.body["value"][0]["@iot.id"].should.eql(3);
                res.body["value"][0]["phenomenonTime"].should.eql('2016-11-18T02:30:00');
                res.body["value"][1]["@iot.id"].should.eql(0);
                res.body["value"][1]["phenomenonTime"].should.eql('2016-11-18T02:45:00');
                done();
            });
    });

    it("interval(1 min)", (done) => {
        chai.request(server)
            .get(`/test/v1.0/Datastreams(3)/Observations?$interval=1 min`)
            .end((err: any, res: any) => {                 
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body["@iot.count"].should.eql("241");
                res.body.value.length.should.eql(241);
                res.body["value"][0]["@iot.id"].should.eql(3);
                res.body["value"][0]["phenomenonTime"].should.eql('2016-11-18T02:16:00');
                res.body["value"][1]["@iot.id"].should.eql(0);
                res.body["value"][1]["phenomenonTime"].should.eql('2016-11-18T02:17:00');
                done();
            });
    });

    it("interval(1 day)", (done) => {
        chai.request(server)
            .get(`/test/v1.0/Datastreams(4)/Observations?$interval=1 day`)
            .end((err: any, res: any) => { 
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal("application/json");
                res.body["@iot.count"].should.eql("6045");
                res.body.value.length.should.eql(6045);
                res.body["value"][0]["@iot.id"].should.eql(49);
                res.body["value"][0]["phenomenonTime"].should.eql('2000-05-02T02:00:00');
                res.body["value"][1]["@iot.id"].should.eql(50);
                res.body["value"][1]["phenomenonTime"].should.eql('2000-05-03T02:00:00');
                res.body["value"][5]["@iot.id"].should.eql(0);
                res.body["value"][5]["phenomenonTime"].should.eql('2000-05-07T02:00:00');
                done();
            });
    });

    it("Save and write apiDoc", (done) => {
        generateApiDoc(docs, "apiDocBuiltInMisc.js");
        done();
    });

});
