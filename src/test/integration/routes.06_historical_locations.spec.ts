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
	defaultDelete,
	defaultPatch,
	defaultGet,
	listOfColumns,
	limitResult,
	infos,
	apiInfos,
	showHide,
	nbColorTitle,
	nbColor,
	testVersion,
	_RAWDB,
	Iinfos
} from "./constant";
import {
	server
} from "../../server/index";
import {
	Ientity
} from "../../server/types";
import {
	testsKeys as locations_testsKeys
} from "./routes.05_locations.spec";
import {
	executeQuery,
	last
} from "./executeQuery";
import {
	addDeleteTest,
	addGetTest,
	addPatchTest,
	addStartNewTest
} from "./tests";

const testsKeys = ["@iot.selfLink", "@iot.id", "Things@iot.navigationLink", "Locations@iot.navigationLink", "time"];

chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];
const entity: Ientity = _RAWDB.HistoricalLocations;

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

describe("endpoint : HistoricalLocations", () => {
	const temp = listOfColumns(entity);
	const success = temp.success;
	// const params = temp.params;
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
			const infos: Iinfos = {
				api: `{get} ${entity.name} Get all`,
				url: `/${testVersion}/${entity.name}`,
				apiName: `GetAll${entity.name}`,
				apiDescription: `Retrieve all ${entity.name}.${showHide(`Get${entity.name}`, apiInfos["9.2.2"])}`,
				apiReference: "https://docs.ogc.org/is/18-088/18-088.html#usage-address-collection-entities",
				apiExample: {
					http: `/test`,
					curl: defaultGet("curl", "KEYHTTP"),
					javascript: defaultGet("javascript", "KEYHTTP"),
					python: defaultGet("python", "KEYHTTP")
				},
				apiSuccess: ["{number} id @iot.id", "{relation} selfLink @iot.selfLink", ...success]
			};

			chai.request(server)
				.get(`/test${infos.url}`)
				.end((err, res) => {
					addStartNewTest(entity.name);
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
					addGetTest(infos);
					done();
				});
		});

		it(`Return ${entity.name} id: 1 ${nbColor}[9.2.3]`, (done) => {
			api : `{get} ${entity.name}(:id) Get One`;
			url : `/${testVersion}/${entity.name}(1)`;
			const infos: Iinfos = {
				api: `{get} ${entity.name}(:id) Get one`,
				url: `/${testVersion}/${entity.name}(1)`,
				apiName: `GetOne${entity.name}`,
				apiDescription: `Get a specific ${entity.singular}.${apiInfos["9.2.3"]}`,
				apiReference: "https://docs.ogc.org/is/18-088/18-088.html#usage-address-entity",
				apiExample: {
					http: "/test",
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
					res.body.should.include.keys(testsKeys);
					res.body["@iot.selfLink"].should.contain(`/${entity.name}(1)`);
					res.body["@iot.id"].should.eql(1);
					res.body["Things@iot.navigationLink"].should.contain(`/${entity.name}(1)/Things`);
					addToApiDoc({
						...infos,
						result: limitResult(res)
					});
					addGetTest(infos);
					done();
				});
		});

		it(`Return error if ${entity.name} not exist ${nbColor}[9.2.4]`, (done) => {
			const infos: Iinfos = {
				api: `Return error if ${entity.name} not exist`,
				url: `/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`,
				apiName: "",
				apiDescription: "",
				apiReference: ""
			};
			chai.request(server)
				.get(`/test${infos.url}`)
				.end((err, res) => {
					should.not.exist(err);
					res.status.should.equal(404);
					res.type.should.equal("application/json");
					docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4).replace(Number.MAX_SAFE_INTEGER.toString(), "1");
					addGetTest(infos);
					done();
				});
		});

		it(`Return ${entity.name} id: 6 and $expand Locations ${nbColor}[9.3.2.1]`, (done) => {
            const name = "Locations";
			const infos: Iinfos = {
				api: `{get} ${entity.name}(:id) Get Expand ${name}`,
				url: `/${testVersion}/${entity.name}(6)?$expand=${name}`,
				apiName: `Get${entity.name}Expand`,
				apiDescription: `Get Expand Locations of a specific Thing.${apiInfos["9.3.2.1"]}`,
				apiReference: "https://docs.ogc.org/is/18-088/18-088.html#expand",
				apiExample: {
					http: "/test",
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
					res.body.should.include.keys(testsKeys.filter((elem) => elem !== "Locations@iot.navigationLink"));
					res.body.should.include.keys(name);
					res.body.Locations.length.should.eql(2);
					res.body.Locations[0].should.include.keys(locations_testsKeys);
					res.body["@iot.id"].should.eql(6);
					addToApiDoc({
						...infos,
						result: limitResult(res)
					});
					addGetTest(infos);
					done();
				});
		});

		it(`Return specified time of ${entity.name} id: 6`, (done) => {
			const infos:Iinfos  = {
				api : `{get} ${entity.name}(:id) Get Select`,
				url : `/${testVersion}/${entity.name}(6)?$select=time`,				
				apiName: `GetSelectTime${entity.name}`,
				apiDescription: "Retrieve time for a specific Historical Location.",
				apiExample: {
					http: "/test",
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
					res.body.should.include.keys("time");
					addToApiDoc({
						...infos,
						result: limitResult(res)
					});
					addGetTest(infos);
					done();
				});
		});

		it(`Return ${entity.name} Subentity Things ${nbColor}[9.2.6]`, (done) => {
			const name = "Things";
			const infos: Iinfos = {
				api: `{get} ${entity.name}(:id) Get Subentity ${name}`,
				url: `/${testVersion}/${entity.name}(6)/${name}`,
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
					res.body["@iot.count"].should.eql(1);
					const id = Number(res.body.value[0]["@iot.id"]);
					res.body.value[0]["@iot.selfLink"].should.contain(`/${name}(${id})`);
					res.body.value[0]["Locations@iot.navigationLink"].should.contain(`/${name}(${id})/Location`);
					res.body.value[0]["HistoricalLocations@iot.navigationLink"].should.contain(`/${name}(${id})/HistoricalLocations`);
					res.body.value[0]["Datastreams@iot.navigationLink"].should.contain(`/${name}(${id})/Datastreams`);
					res.body.value[0]["MultiDatastreams@iot.navigationLink"].should.contain(`/${name}(${id})/MultiDatastreams`);
					addGetTest(infos);
					done();
				});
		});

		it(`Return ${entity.name} Subentity Locations ${nbColor}[9.2.6]`, (done) => {
			const name = "Locations";
			const infos: Iinfos = {
				api: `{get} ${entity.name}(:id) Get Subentity ${name}`,
				url: `/${testVersion}/${entity.name}(6)/${name}`,
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
					res.body["@iot.count"].should.eql(2);
					const id = Number(res.body.value[0]["@iot.id"]);
					res.body.value[0]["@iot.selfLink"].should.contain(`/${name}(${id})`);
					res.body.value[0]["Things@iot.navigationLink"].should.contain(`/${name}(${id})/Things`);
					res.body.value[0]["HistoricalLocations@iot.navigationLink"].should.contain(`/${name}(${id})/HistoricalLocations`);
					addGetTest(infos);
					done();
				});
		});

		it(`Return ${entity.name} Expand Things ${nbColor}[9.3.2.1]`, (done) => {
			const name = "Things";
			const infos: Iinfos = {
				api: `{get} return ${entity.name} Expand ${name}`,
				url: `/${testVersion}/${entity.name}(1)?$expand=${name}`,
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
					const id = Number(res.body[name][0]["@iot.id"]);
					res.body[name][0]["@iot.selfLink"].should.contain(`/${name}(${id})`);
					res.body[name][0]["Locations@iot.navigationLink"].should.contain(`${name}(${id})/Location`);
					res.body[name][0]["HistoricalLocations@iot.navigationLink"].should.contain(`/${name}(${id})/HistoricalLocations`);
					res.body[name][0]["Datastreams@iot.navigationLink"].should.contain(`${name}(${id})/Datastreams`);
					res.body[name][0]["MultiDatastreams@iot.navigationLink"].should.contain(`${name}(${id})/MultiDatastreams`);
					addGetTest(infos);
					done();
				});
		});

		it(`Return ${entity.name} Expand Locations ${nbColor}[9.3.2.1]`, (done) => {
			const name = "Locations";
			const infos: Iinfos = {
				api: `{get} return ${entity.name} Expand ${name}`,
				url: `/${testVersion}/${entity.name}(1)?$expand=${name}`,
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
					const id = Number(res.body[name][0]["@iot.id"]);
					res.body[name][0]["@iot.selfLink"].should.contain(`/${name}(${id})`);
					res.body[name][0]["Things@iot.navigationLink"].should.contain(`/${name}(${id})/Things`);
					res.body[name][0]["HistoricalLocations@iot.navigationLink"].should.contain(`/${name}(${id})/HistoricalLocations`);
					addGetTest(infos);
					done();
				});
		});
	});

	describe(`{patch} ${entity.name} ${nbColorTitle}[10.3]`, () => {
		it(`Return updated ${entity.name} ${nbColor}[10.3.1]`, (done) => {
			executeQuery(last(entity.table)).then((locations) => {
				const datas = {
					"time": "2015-02-07T19:22:11.297Z"
				};
				const infos:Iinfos  = {
					api : `{patch} ${entity.name} Patch one`,
					url : `/${testVersion}/${entity.name}(${locations["id"]})`,					
					apiName: `Patch${entity.name}`,
					apiDescription: `Patch a ${entity.singular}.${showHide(`Patch${entity.name}`, apiInfos["10.3"])}`,
					apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_request_2",
					apiExample: {
						http: "/test",
						curl: defaultPatch("curl", "KEYHTTP", datas),
						javascript: defaultPatch("javascript", "KEYHTTP", datas),
						python: defaultPatch("python", "KEYHTTP", datas)
					},
					apiParamExample: datas
				};
				chai.request(server)
					.patch(`/test${infos.url}`)
					.send(infos.apiParamExample)
					.set("Cookie", `${keyTokenName}=${token}`)
					.end((err: Error, res: any) => {
						should.not.exist(err);
						addToApiDoc({
							...infos,
							result: limitResult(res)
						});
						addPatchTest(infos, datas);
						done();
					});
			});
		});

		it(`Return Error if the ${entity.name} not exist`, (done) => {
			const datas = {
				"time": "2015-02-07T19:22:11.297Z"
			};
			const infos: Iinfos = {
				api: `{patch} return Error if the ${entity.name} not exist`,
				url: `/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`,
				apiName: "",
				apiDescription: "",
				apiReference: ""
			};

			chai.request(server)
				.patch(`/test${infos.url}`)
				.send(datas)
				.set("Cookie", `${keyTokenName}=${token}`)
				.end((err: Error, res: any) => {
					should.not.exist(err);
					res.status.should.equal(404);
					res.type.should.equal("application/json");

					docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4);
					addPatchTest(infos, datas);
					done();
				});
		});
	});

	describe(`{delete} ${entity.name} ${nbColorTitle}[10.4]`, () => {
		it(`Delete ${entity.name} return no content with code 204 ${nbColor}[10.4.1]`, (done) => {
			executeQuery(`SELECT (SELECT count(id) FROM "${entity.table}")::int as count, (${last(entity.table)})::int as id `).then((beforeDelete) => {
				const infos:Iinfos  = {
					api : `{delete} ${entity.name} Delete one`,
					url : `/${testVersion}/${entity.name}(${beforeDelete["id"]})`,					
					apiName: `Delete${entity.name}`,
					apiDescription: `Delete a ${entity.singular}.${showHide(`Delete${entity.name}`, apiInfos["10.4"])}`,
					apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_request_3",
					apiExample: {
						http: "/test",
						curl: defaultDelete("curl", "KEYHTTP"),
						javascript: defaultDelete("javascript", "KEYHTTP"),
						python: defaultDelete("python", "KEYHTTP")
					}
				};
				chai.request(server)
					.delete(`/test${infos.url}`)
					.set("Cookie", `${keyTokenName}=${token}`)
					.end((err: Error, res: any) => {
						should.not.exist(err);
						res.status.should.equal(204);
						executeQuery(`SELECT count(id)::int FROM "${entity.table}"`).then((afterDelete) => {
							afterDelete["count"].should.eql(beforeDelete["count"] - 1);
							addToApiDoc({
								...infos,
								result: res
							});
							addDeleteTest(infos);
							done();
						});
					});
			});
		});

		it(`Return Error if the ${entity.name} not exist`, (done) => {
			const infos: Iinfos = {
				api: `{delete} return Error if the ${entity.name} not exist`,
				url: `/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`,
				apiName: "",
				apiDescription: "",
				apiReference: ""
			};
			chai.request(server)
				.delete(`/test/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`)
				.set("Cookie", `${keyTokenName}=${token}`)
				.end((err: Error, res: any) => {
					should.not.exist(err);
					res.status.should.equal(404);
					res.type.should.equal("application/json");
					docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4);
					generateApiDoc(docs, `apiDoc${entity.name}.js`);
					addDeleteTest(infos);
					done();
				});
		});
	});
});

