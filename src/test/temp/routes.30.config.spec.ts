/**
 * TDD for ultime tests API
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
process.env.NODE_ENV = "test";
// onsole.log("!----------------------------------- TDD for ultime tests API -----------------------------------!");

import chai from "chai";
import chaiHttp from "chai-http";
import { IApiDoc, IApiInput, prepareToApiDoc, generateApiDoc, limitResult, testVersion, _RAWDB, defaultGet } from "../integration/constant";
import { server } from "../../server/index";
import { addTest, writeLog } from "../integration/tests";

chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];

const addToApiDoc = (input: IApiInput) => {
    docs.push(prepareToApiDoc(input, "Config"));
};

const conf = {
    "name": "newconfig",
    "port": 8030,
    "pg": {
        "host": "localhost",
        "port": 5432,
        "user": "newuser",
        "password": "newpass",
        "database": "newdb",
        "retry": 2
    },
    "apiVersion": "v1.1",
    "date_format": "DD/MM/YYYY hh:mi:ss",
    "webSite": "http://sensorthings.geosas.fr/apidoc/",
    "nb_page": 200,
    "alias": [
        ""
    ],
    "extensions": [
        "base",
        "multiDatastream",
        "logs",
        "users"
    ],
    "options": [
        "canDrop"
    ]

};

addToApiDoc({
    api: `{infos} /Config Infos.`,
    apiName: "InfosConfig",
    apiDescription: `<hr>
    <div class="text">
      <p> You can create a new service if you have autorisation </p>
      <p> post /Config </p>
      <pre> ${conf} </pre>
    </div>`,
    result: ""
});
describe("endpoint : Config", () => {
    const success:string[] = [];   
    describe(`GET /Config`, () => {
        afterEach(() => { writeLog(true); });
		it(`Return all Config`, (done) => {
			const infos = addTest({
				api: `{get} Config Get all`,
				apiName: `GetAllConfig`,
				apiDescription: `Retrieve all Config}`,
				apiReference: "",
				apiExample: {
					http: `${testVersion}/Config`,
					curl: defaultGet("curl", "KEYHTTP"),
					javascript: defaultGet("javascript", "KEYHTTP"),
					python: defaultGet("python", "KEYHTTP")
				},
				apiSuccess: [...success]
			});
			chai.request(server)
				.get(`/test/${infos.apiExample.http}`)
				.end((err, res) => {
					should.not.exist(err);
					res.status.should.equal(200);
					res.type.should.equal("application/json");
					addToApiDoc({
						...infos,
						result: limitResult(res)
					});
					docs[docs.length - 1].apiErrorExample = JSON.stringify({
						"code": 404,
						"message": "Not Found"
					}, null, 4);
					done();
				});
		});

		it(`Return Error if the Config not exist`, (done) => {
			const infos = addTest({
				api: `{delete} return Error if the Config not exist`,
				apiName: "",
				apiDescription: "",
				apiReference: "",
				apiExample: {
					http: `${testVersion}/Config(1)`,
				}
			});
			chai.request(server)
				.get(`/test/${infos.apiExample.http}`)
				.end((err: Error, res: any) => {
					should.not.exist(err);
					res.status.should.equal(404);
					res.type.should.equal("application/json");
					docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4);
					generateApiDoc(docs, `apiDocConfig.js`);
					done();
				});
		});        
    });
});
