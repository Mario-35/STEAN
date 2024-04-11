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
import { IApiDoc, generateApiDoc, IApiInput, prepareToApiDoc, identification, keyTokenName, defaultGet, defaultPost, defaultPatch, defaultDelete, getNB, listOfColumns, limitResult, infos, showHide, apiInfos, nbColorTitle, nbColor, testVersion, _RAWDB } from "./constant";
import { server } from "../../server/index";
import { Ientity } from "../../server/types"; 
import { testsKeys as datastreams_testsKeys } from "./routes.07_datastreams.spec"; 
import { executeQuery, last } from "./executeQuery"; 
import { addStartNewTest, addTest, writeLog } from "./tests";

export const testsKeys = ["@iot.id", "@iot.selfLink", "Datastreams@iot.navigationLink", "name", "description", "definition"];

chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];
const entity: Ientity = _RAWDB.ObservedProperties;


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

describe("endpoint : ObservedProperties", () => {
	const myId = "";
	const temp = listOfColumns(entity);
	const success = temp.success;
	const params = temp.params;
	let token = "";
	
	before((done) => {
		addStartNewTest(entity.name);
		chai.request(server)
			.post(`/test/${testVersion}/login`)
			.send(identification)
			.end((err: Error, res: any) => {
				token = String(res.body["token"]);
				done();
			});
	});

	describe(`{get} ${entity.name} ${nbColorTitle}[9.2]`, () => {
		afterEach(() => { writeLog(true); });

		it(`Return all ${entity.name} ${nbColor}[9.2.2]`, (done) => {
			const infos = addTest({
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
			});
			chai.request(server)
				.get(`/test${infos.url}`)
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

		it(`Return observedProperty id: 2 ${nbColor}[9.2.3]`, (done) => {
			const infos = addTest({
				api: `{get} ${entity.name}(:id) Get one`,
				url: `/${testVersion}/${entity.name}(2)`,
				apiName: `GetOne${entity.name}`,
				apiDescription: `Get a specific ${entity.singular}.${apiInfos["9.2.3"]}`,
				apiReference: "https://docs.ogc.org/is/18-088/18-088.html#usage-address-entity",
				apiExample: {
					http: "/test",
					curl: defaultGet("curl", "KEYHTTP"),
					javascript: defaultGet("javascript", "KEYHTTP"),
					python: defaultGet("python", "KEYHTTP")
				}
			});
			chai.request(server)
				.get(`/test${infos.url}`)
				.end((err: Error, res: any) => {
					should.not.exist(err);
					res.status.should.equal(200);
					res.type.should.equal("application/json");
					res.body.should.include.keys(testsKeys);
					res.body["@iot.selfLink"].should.contain("/ObservedProperties(2)");
					res.body["@iot.id"].should.eql(2);
					res.body["Datastreams@iot.navigationLink"].should.contain("/ObservedProperties(2)/Datastreams");
					addToApiDoc({
						...infos,
						result: limitResult(res)
					});
					
					done();
				});
		});

		it(`Return error if ${entity.name} not exist ${nbColor}[9.2.4]`, (done) => {
			const infos = addTest({
				api: `Return error if ${entity.name} not exist`,
				url: `/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`,
				apiName: "",
				apiDescription: "",
				apiReference: ""
			});
			chai.request(server)
				.get(`/test${infos.url}`)
				.end((err, res) => {
					should.not.exist(err);
					res.status.should.equal(404);
					res.type.should.equal("application/json");
					docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4).replace(Number.MAX_SAFE_INTEGER.toString(), "1");
					
					done();
				});
		});

		it("Return observedProperty of a specific Datastream", (done) => {
			const infos = addTest({
				api : `{get} Datastream(10/${entity.name} Get from a specific Datastream`,
				url : `/${testVersion}/Datastreams(9)/ObservedProperty`,
				apiName: `GetDatastream${entity.name}`,
				apiDescription: "Get observed Property from Datastream",
				apiExample: {
					http: "/test",
					curl: defaultGet("curl", "KEYHTTP"),
					javascript: defaultGet("javascript", "KEYHTTP"),
					python: defaultGet("python", "KEYHTTP")
				}
			});
			chai.request(server)
				.get(`/test${infos.url}`)
				.end((err: Error, res: any) => {
					should.not.exist(err);
					res.status.should.equal(200);
					res.type.should.equal("application/json");
					res.body.should.include.keys("value");
					res.body.value[0].should.include.keys(testsKeys);
					res.body["@iot.count"].should.eql(1);
					res.body.value.length.should.eql(1);
					const id = res.body.value[0]["@iot.id"];
					res.body.value[0]["@iot.id"].should.eql(id);
					res.body.value[0]["@iot.selfLink"].should.contain(`/ObservedProperties(${id})`);
					res.body.value[0]["Datastreams@iot.navigationLink"].should.contain(`/ObservedProperties(${id})/Datastreams`);
					addToApiDoc({
						...infos,
						result: limitResult(res)
					});
					
					done();
				});
		});

		it("Return observedProperty with inline related entities using $expand query option", (done) => {
			const infos = addTest({
				api : `{get} ${entity.name}(:id) Get Expand Datastreams`,
				url : `/${testVersion}/${entity.name}(1)?$expand=Datastreams`,				
				apiName: `GetExpandDatastreams${entity.name}`,
				apiDescription: "`Get a specific observed Property and expand Datastreams.",
				apiExample: {
					http: "/test",
					curl: defaultGet("curl", "KEYHTTP"),
					javascript: defaultGet("javascript", "KEYHTTP"),
					python: defaultGet("python", "KEYHTTP")
				}
			});
			chai.request(server)
				.get(`/test${infos.url}`)
				.end((err: Error, res: any) => {
					should.not.exist(err);
					res.status.should.equal(200);
					res.type.should.equal("application/json");
					res.body.should.include.keys("Datastreams");
					res.body.Datastreams[0].should.include.keys(datastreams_testsKeys);
					res.body["@iot.id"].should.eql(1);
					addToApiDoc({
						...infos,
						result: limitResult(res, "Datastreams")
					});
					
					done();
				});
		});

		it(`Retrieve specified properties for a specific ${entity.name}`, (done) => {
			const infos = addTest({
				api : `{get} ${entity.name}(:id) Get from a Select`,
				url : `/${testVersion}/${entity.name}(1)?$select=description`,				
				apiName: `GetSelectDescription${entity.name}`,
				apiDescription: "Retrieve specified properties for a specific observed Property.",
				apiExample: {
					http: "/test",
					curl: defaultGet("curl", "KEYHTTP"),
					javascript: defaultGet("javascript", "KEYHTTP"),
					python: defaultGet("python", "KEYHTTP")
				}
			});
			chai.request(server)
				.get(`/test${infos.url}`)
				.end((err: Error, res: any) => {
					should.not.exist(err);
					res.status.should.equal(200);
					res.type.should.equal("application/json");
					Object.keys(res.body).length.should.eql(1);
					res.body.should.include.keys("description");
					addToApiDoc({
						...infos,
						result: limitResult(res)
					});					
					done();
				});

			it("Return Sensor Subentity Datastreams", (done) => {
				const name = "Datastreams";
				const infos = addTest({
					api: `{get} ${entity.name}(:id) Get Subentity ${name}`,
					url: `/${testVersion}/${entity.name}(11)/${name}`,
					apiName: "",
					apiDescription: "",
					apiReference: ""
				});
				chai.request(server)
					.get(`/test${infos.url}`)
					.end((err: Error, res: any) => {
						should.not.exist(err);
						res.status.should.equal(200);
						res.type.should.equal("application/json");
						res.body["@iot.count"].should.eql(2);
						const id = Number(res.body.value[0]["@iot.id"]);
						res.body.value[0]["@iot.selfLink"].should.contain(`/${name}(${id})`);
						res.body.value[0]["Thing@iot.navigationLink"].should.contain(`/${name}(${id})/Thing`);
						res.body.value[0]["Sensor@iot.navigationLink"].should.contain(`/${name}(${id})/Sensor`);
						res.body.value[0]["ObservedProperty@iot.navigationLink"].should.contain(`/${name}(${id})/ObservedProperty`);
						res.body.value[0]["Observations@iot.navigationLink"].should.contain(`/${name}(${id})/Observations`);
						
						done();
					});
			});

			it("Return Sensor Subentity MultiDatastreams", (done) => {
				const name = "MultiDatastreams";
				const infos = addTest({
					api: `{get} ${entity.name}(:id) Get Subentity ${name}`,
					url: `/${testVersion}/${entity.name}(11)/${name}`,
					apiName: "",
					apiDescription: "",
					apiReference: ""
				});
				chai.request(server)
					.get(`/test${infos.url}`)
					.end((err: Error, res: any) => {
						should.not.exist(err);
						res.status.should.equal(200);
						res.type.should.equal("application/json");
						const id = Number(res.body.value[0]["@iot.id"]);
						res.body.value[0]["@iot.selfLink"].should.contain(`/${name}(${id})`);
						res.body.value[0]["Thing@iot.navigationLink"].should.contain(`/${name}(${id})/Thing`);
						res.body.value[0]["Sensor@iot.navigationLink"].should.contain(`/${name}(${id})/Sensor`);
						res.body.value[0]["ObservedProperties@iot.navigationLink"].should.contain(`/${name}(${id})/ObservedProperties`);
						res.body.value[0]["Observations@iot.navigationLink"].should.contain(`/${name}(${id})/Observations`);
						
						done();
					});
			});

			it("Return Sensor Expand Datastreams", (done) => {
				const name = "Datastreams";
				const infos = addTest({
					api: `{get} return ${entity.name} Expand ${name}`,
					url: `/${testVersion}/${entity.name}(6)?$expand=${name}`,
					apiName: "",
					apiDescription: "",
					apiReference: ""
				});
				chai.request(server)
					.get(`/test${infos.url}`)
					.end((err: Error, res: any) => {
						should.not.exist(err);
						res.status.should.equal(200);
						res.type.should.equal("application/json");
						const id = Number(res.body[name][0]["@iot.id"]);
						res.body[name][0]["@iot.selfLink"].should.contain(`/${name}(${id})`);
						res.body[name][0]["Thing@iot.navigationLink"].should.contain(`/${name}(${id})/Thing`);
						res.body[name][0]["Sensor@iot.navigationLink"].should.contain(`/${name}(${id})/Sensor`);
						res.body[name][0]["ObservedProperty@iot.navigationLink"].should.contain(`/${name}(${id})/ObservedProperty`);
						res.body[name][0]["Observations@iot.navigationLink"].should.contain(`/${name}(${id})/Observations`);
						
						done();
					});
			});

			it("Return Sensor Expand MultiDatastreams", (done) => {
				const name = "MultiDatastreams";
				const infos = addTest({
					api: `{get} return ${entity.name} Expand ${name}`,
					url: `/${testVersion}/${entity.name}(6)?$expand=${name}`,
					apiName: "",
					apiDescription: "",
					apiReference: ""
				});
				chai.request(server)
					.get(`/test${infos.url}`)
					.end((err: Error, res: any) => {
						should.not.exist(err);
						res.status.should.equal(200);
						res.type.should.equal("application/json");
						const id = Number(res.body[name][0]["@iot.id"]);
						res.body[name][0]["@iot.selfLink"].should.contain(`/${name}(${id})`);
						res.body[name][0]["Thing@iot.navigationLink"].should.contain(`/${name}(${id})/Thing`);
						res.body[name][0]["Sensor@iot.navigationLink"].should.contain(`/${name}(${id})/Sensor`);
						res.body[name][0]["ObservedProperties@iot.navigationLink"].should.contain(`/${name}(${id})/ObservedProperties`);
						res.body[name][0]["Observations@iot.navigationLink"].should.contain(`/${name}(${id})/Observations`);
						
						done();
					});
			});
		});
	});

	describe(`{post} ${entity.name} ${nbColorTitle}[10.2]`, () => {
		afterEach(() => { writeLog(true); });

		it(`Return added ${entity.name} ${nbColor}[10.2.1]`, (done) => {
			const datas = {
				name: `Area ${getNB(entity.name)}`,
				description: "The degree or intensity of heat present in the area",
				definition: "http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html#AreaTemperature"
			};
			const infos = addTest({
				api : `{post} ${entity.name} Post basic`,
				url : `/${testVersion}/${entity.name}`,				
				apiName: `Post${entity.name}`,
				apiDescription: `Post a new ${entity.name}.${showHide(`Post${entity.name}`, apiInfos["10.2"])}`,
				apiReference: "https://docs.ogc.org/is/18-088/18-088.html#_request",
				apiExample: {
					http: "/test",
					curl: defaultPost("curl", "KEYHTTP", datas),
					javascript: defaultPost("javascript", "KEYHTTP", datas),
					python: defaultPost("python", "KEYHTTP", datas)
				},
				apiParam: params,
				apiParamExample: datas
			});
			chai.request(server)
				.post(`/test${infos.url}`)
				.send(infos.apiParamExample)
				.set("Cookie", `${keyTokenName}=${token}`)
				.end((err: Error, res: any) => {
					should.not.exist(err);
					res.status.should.equal(201);
					res.type.should.equal("application/json");
					res.body.should.include.keys(testsKeys);
					addToApiDoc({
						...infos,
						result: limitResult(res)
					});
					done();
				});
		});

        it(`Return Error if the payload is malformed ${nbColor}[10.2.2]`, (done) => {
            const infos = addTest({
                api : `{post} return Error if the payload is malformed`,
                url : `/${testVersion}/${entity.name}`,
                apiName: "",
                apiDescription: "",
                apiReference: ""
            });
            chai.request(server)
                .post(`/test${infos.url}`)
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
	});

	describe(`{patch} ${entity.name} ${nbColorTitle}[10.3]`, () => {
		afterEach(() => { writeLog(true); });

		it(`Return updated ${entity.name} ${nbColor}[10.3.1]`, (done) => {
			executeQuery(last(entity.table, true)).then((result) => {
				const datas = {
					name: `New PM 2.5 ${getNB(entity.name)}`,
				};
				const infos = addTest({
					api : `{patch} ${entity.name} Patch one`,
				url : `/${testVersion}/${entity.name}(${result["id"]})`,					
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
				});
				chai.request(server)
					.patch(`/test${infos.url}`)
					.send(infos.apiParamExample)
					.set("Cookie", `${keyTokenName}=${token}`)
					.end((err: Error, res: any) => {
						should.not.exist(err);
						res.status.should.equal(200);
						res.type.should.equal("application/json");
						res.body.should.include.keys(testsKeys);
						res.body.name.should.not.eql(result["name"]);
						addToApiDoc({
							...infos,
							result: limitResult(res)
						});
						done();
					});
			});
		});

		it(`Return Error if the ${entity.name} not exist`, (done) => {
			const datas = {
				"name": "New SensorWebThing Patch",
				"properties": {
					"organization": "Mozilla",
					"owner": "Mozilla"
				}
			};
			const infos = addTest({
				api: `{patch} return Error if the ${entity.name} not exist`,
				url: `/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`,
				apiName: "",
				apiDescription: "",
				apiReference: ""
			});
			chai.request(server)
				.patch(`/test${infos.url}`)
				.set("Cookie", `${keyTokenName}=${token}`)
				.send(datas)
				.end((err: Error, res: any) => {
					should.not.exist(err);
					res.status.should.equal(404);
					res.type.should.equal("application/json");
					docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4).replace(Number.MAX_SAFE_INTEGER.toString(), String(myId));
					done();
				});
		});
	});

	describe(`{delete} ${entity.name} ${nbColorTitle}[10.4]`, () => {
		afterEach(() => { writeLog(true); });

		it(`Delete ${entity.name} return no content with code 204 ${nbColor}[10.4.1]`, (done) => {
			executeQuery(`SELECT (SELECT count(id) FROM "${entity.table}")::int as count, (${last(entity.table)})::int as id `).then((beforeDelete) => {
				const infos = addTest({
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
				});
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
								result: limitResult(res)
							});
							
							done();
						});
					});
			});
		});

		it(`Return Error if the ${entity.name} not exist`, (done) => {
			const infos = addTest({
				api: `{delete} return Error if the ${entity.name} not exist`,
				url: `/${testVersion}/${entity.name}(${BigInt(Number.MAX_SAFE_INTEGER)})`,
				apiName: "",
				apiDescription: "",
				apiReference: ""
			});
			chai.request(server)
				.delete(`/test${infos.url}`)
				.set("Cookie", `${keyTokenName}=${token}`)
				.end((err: Error, res: any) => {
					should.not.exist(err);
					res.status.should.equal(404);
					res.type.should.equal("application/json");
					docs[docs.length - 1].apiErrorExample = JSON.stringify(res.body, null, 4).replace(Number.MAX_SAFE_INTEGER.toString(), String(myId));
					generateApiDoc(docs, `apiDoc${entity.name}.js`);
					
					done();
				});
		})
	});
});