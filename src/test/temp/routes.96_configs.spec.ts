/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TDD for Format API.
 *
 * @copyright 2020-present Inrae
 * @review 29-10-2024
 * @author mario.adam@inrae.fr
 *
 */
process.env.NODE_ENV = "test";

import chai from "chai";
import chaiHttp from "chai-http";
import { IApiDoc, generateApiDoc, IApiInput, defaultPost,prepareToApiDoc, limitResult, testVersion, _RAWDB, keyTokenName, identification, testLog } from "./constant";
import { server } from "../../server/index";
import { Ientity } from "../../server/types";

chai.use(chaiHttp);``

const should = chai.should();
const docs: IApiDoc[] = [];
const entity: Ientity = _RAWDB.Configs;

const addToApiDoc = (input: IApiInput) => {
    docs.push(prepareToApiDoc(input, "Configs"));
};

addToApiDoc({
    api: `{infos} /Config Infos.`,
    apiName: "ConfigsInfos",
    apiDescription: `Configs can show or create services.`,
    result: ""
});

describe("Configs", () => {
    let token = "";

    before((done) => {
        chai.request(server)
            .post(`/test/${testVersion}/login`)
            .send(identification)
            .type("form")
            .end((err: Error, res: any) => {
                token = String(res.body["token"]);
                done();
                });
    });

    describe("{get} Config", () => {
        it("Return Configs", (done) => {
            const infos = addTest({
                api: `{get} ResultFormat as csv`,
                apiName: "ConfigsAll",
                apiDescription: 'Use $resultFormat=csv to get datas as csv format.<br><img class="tabLogo" src="./assets/csv.jpg" alt="csv result">',
                apiExample: { http: `/${testVersion}/Datastreams(1)/Observations?$top=20&$resultFormat=csv` }
            });
            chai.request(server)
                .get(`/test/${infos.apiExample.http}`)
                .end((err: Error, res: any) => {
                    testLog(res.bady);
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("text/csv");
                    res.text.startsWith(`"@iot.${"id"}";`);
                    addToApiDoc({ ...infos, result: res });
                    done();
                });
        });
    });

    describe(`{post} ${entity.name}`, () => {
        it(`Return added ${entity.name}`, (done) => {
            const datas = {
                "name": "essai",
                "port": 8029,
                "pg": {
                  "host": "localhost",
                  "port": 5432,
                  "user": "sensorapi",
                  "password": "mario29",
                  "database": "essai",
                  "retry": 2
                },
                "apiVersion": "1.1",
                "date_format": "DD/MM/YYYY hh:mi:ss",
                "webSite": "http://sensorthings.geosas.fr/apidoc/",
                "nb_page": 200,
                "forceHttps": false,
                "alias": [],
                "extensions": [
                  "base",
                  "logs"
                ],
                "highPrecision": false,
                "canDrop": true,
                "logFile": ""
              };
            const infos = addTest({
                api: `{post} ${entity.name} Post basic`,
                apiName: `Post${entity.name}`,
                apiDescription: `Post a new ${entity.name}`,
                apiReference: "",
                apiPermission: "admin:computer",
                apiExample: {
                    http: `/${testVersion}/${entity.name}`,
                    curl: defaultPost("curl", "KEYHTTP", datas),
                    javascript: defaultPost("javascript", "KEYHTTP", datas),
                    python: defaultPost("python", "KEYHTTP", datas)
                },
                apiParamExample: datas
            };
            chai.request(server)
                .post(`/test/${infos.apiExample.http}`)
                .send(infos.apiParamExample)
                .set("Cookie", `${keyTokenName}=${token}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(201);
                    res.type.should.equal("application/json");
                    addToApiDoc({ ...infos, result: limitResult(res) });
                    done();
                });
        });
    });

    describe("Save apiDocFormat.", () => {
        it("Do not test only for save apiDoc", (done) => {
            generateApiDoc(docs, "apiDocFormat.js");
            done();
        });
    });
});
