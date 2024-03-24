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
import { server } from "../../server/index";
import { Iinfos } from "./constant";
import { addGetTest, addStartNewTest } from "./tests";


chai.use(chaiHttp);

const should = chai.should();

const tests = {
    "/test/v1.1/Things?$filter=Datastreams/ObservedProperty/description eq 'Description of classic Observed Property'": 1,
    "/test/v1.1/Observations?$filter=phenomenonTime gt 2023-10-13T06:37:13+02:00": 6,
    "/test/v1.1/Things?$filter=Datastreams/unitOfMeasurement/name eq 'Pression'": 1,
    "/test/v1.1/Things?$filter=Datastreams/unitOfMeasurement/name eq 'PM 2.5 Particulates (ug/m3)'": 1,
    "/test/v1.1/Observations?$filter=result gt 290 or result eq 250": 524,
    "/test/v1.1/Observations?$filter=length(result) le 2": 551,
    "/test/v1.1/Things?$filter=Datastreams/Observations/resultTime ge 2020-06-01T00:00:00Z and Datastreams/Observations/resultTime le 2022-07-01T00:00:00Z": 4,
    "/test/v1.1/Locations?$filter=geo.intersects(location, geography'POLYGON ((-4.21284 47.87193, -4.22584 48.04148, -3.99840 48.05802,-4.01317 47.90265,-4.21284 47.87193))') and location/type eq 'Point'": 3,
    "/test/v1.1/Locations?$filter=geo.intersects(geography'POLYGON ((-4.21284 47.87193, -4.22584 48.04148, -3.99840 48.05802,-4.01317 47.90265,-4.21284 47.87193))', location) and location/type eq 'Point'": 3,
    // "/test/v1.1/Things?$filter=Datastreams/Observations/FeatureOfInterest/id eq 'FOI_1' and Datastreams/Observations/resultTime ge 2010-06-01T00:00:00Z and date(Datastreams/Observations/resultTime) le date(2010-07-01T00:00:00Z)",
    // "/test/v1.1/Datastreams?$expand=Observations($filter=result eq 1;$expand=FeatureOfInterest;$select=@iot.id;$orderby=id;$skip=5;$top=10;$count=true),ObservedProperty",
    // "/test/v1.1/Locations?$orderby=geo.distance(location,geography'POINT(8.0 52.0)')",
    // "/test/v1.1/Locations?$filter=geo.intersects(location, geography'LINESTRING(7.5 51, 7.5 54)')",
    // "/test/v1.1/Locations?$filter=st_contains(geography'POLYGON((7.5 51.5, 7.5 53.5, 8.5 53.5, 8.5 51.5, 7.5 51.5))', location)",
    // "/test/v1.1/Locations?$filter=st_crosses(geography'LINESTRING(7.5 51.5, 7.5 53.5)', location)",
    // "/test/v1.1/Locations?$filter=st_disjoint(geography'POLYGON((7.5 51.5, 7.5 53.5, 8.5 53.5, 8.5 51.5, 7.5 51.5))', location)",
    // "/test/v1.1/Locations?$filter=st_equals(location, geography'POINT(8 53)')",
    // "/test/v1.1/Locations?$filter=st_intersects(location, geography'LINESTRING(7.5 51, 7.5 54)')",
    // "/test/v1.1/Locations?$filter=st_overlaps(geography'POLYGON((7.5 51.5, 7.5 53.5, 8.5 53.5, 8.5 51.5, 7.5 51.5))', location)",
    // "/test/v1.1/Locations?$filter=st_relate(geography'POLYGON((7.5 51.5, 7.5 53.5, 8.5 53.5, 8.5 51.5, 7.5 51.5))', location, 'T********')",
    // "/test/v1.1/Locations?$filter=st_touches(geography'POLYGON((8 53, 7.5 54.5, 8.5 54.5, 8 53))', location)",
    // "/test/v1.1/Locations?$filter=st_within(geography'POINT(7.5 52.75)', location)",
    // "/test/v1.1/Observations?$filter=validTime gt 2016-01-02T01:01:01.000Z/2016-01-03T23:59:59.999Z sub duration'P1D'"


};
const demoStart ={ "description": "thing 1", "name": "thing name 1", "properties": { "reference": "first" }, "Locations": [ { "description": "location 1", "name": "location name 1", "location": { "type": "Point", "coordinates": [ -117.05, 51.05 ] }, "encodingType": "application/geo+json" } ], "Datastreams": [ { "unitOfMeasurement": { "name": "Lumen", "symbol": "lm", "definition": "http://www.qudt.org/qudt/owl/1.0.0/unit/Instances.html/Lumen" }, "description": "datastream 1", "name": "datastream name 1", "observationType": "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement", "ObservedProperty": { "name": "Luminous Flux", "definition": "http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html/LuminousFlux", "description": "observedProperty 1" }, "Sensor": { "description": "sensor 1", "name": "sensor name 1", "encodingType": "application/pdf", "metadata": "Light flux sensor" }, "Observations":[ { "phenomenonTime": "2015-03-03T00:00:00Z", "result": 3 }, { "phenomenonTime": "2015-03-04T00:00:00Z", "result": 4 } ] }, { "unitOfMeasurement": { "name": "Centigrade", "symbol": "C", "definition": "http://www.qudt.org/qudt/owl/1.0.0/unit/Instances.html/Lumen" }, "description": "datastream 2", "name": "datastream name 2", "observationType": "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement", "ObservedProperty": { "name": "Tempretaure", "definition": "http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html/Tempreture", "description": "observedProperty 2" }, "Sensor": { "description": "sensor 2", "name": "sensor name 2", "encodingType": "application/pdf", "metadata": "Tempreture sensor" }, "Observations":[ { "phenomenonTime": "2015-03-05T00:00:00Z", "result": 5 }, { "phenomenonTime": "2015-03-06T00:00:00Z", "result": 6 } ] } ] };
console.log(demoStart);

describe("Various Get tests", () => {
    before((done) => {
        addStartNewTest("Various");
				done();
	});
    Object.keys(tests).forEach((test: string) => {
        it(test, (done) => {
            const infos: Iinfos = {
				api: `result => ${+tests[test]} : `,
				url: test,
				apiName: "",
				apiDescription: "",
				apiReference: ""
			};
            chai.request(server)
                .get(test)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    res.body["@iot.count"].should.eql(+tests[test]);
					addGetTest(infos);                    
                    done();
                });
        });

    });
});


