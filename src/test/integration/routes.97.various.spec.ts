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


chai.use(chaiHttp);

const should = chai.should();

const tests = [
    "/test/v1.0/Things?$filter=Datastreams/description eq 'Air quality Number'",
    "/test/v1.0/Things?$filter=Datastreams/ObservedProperty/description eq 'PM something Number three'",
    "/test/v1.0/Observations?$filter=validTime gt 2016-01-02T01:01:01.123Z",
    // "/test/v1.0/Observations?$filter=validTime gt 2016-01-02T01:01:01,123Z",
    // "/test/v1.0/Observations?$filter=length(result) le 2",
    // "/test/v1.0/Things?$filter=name eq 'it''s a quote'",
    // "/test/v1.0/Things?$filter=name eq 'it''''s two quotes'",
    // "/test/v1.0/Things?$filter=Datastreams/Observations/FeatureOfInterest/id eq 'FOI_1' and Datastreams/Observations/resultTime ge 2010-06-01T00:00:00Z and date(Datastreams/Observations/resultTime) le date(2010-07-01T00:00:00Z)",
    // "/test/v1.0/Datastreams?$expand=Observations($filter=result eq 1;$expand=FeatureOfInterest;$select=@iot.id;$orderby=id;$skip=5;$top=10;$count=true),ObservedProperty",
    // "/test/v1.0/Locations?$orderby=geo.distance(location,geography'POINT(8.0 52.0)')",
    // "/test/v1.0/Locations?$filter=geo.intersects(location, geography'LINESTRING(7.5 51, 7.5 54)')",
    // "/test/v1.0/Locations?$filter=st_contains(geography'POLYGON((7.5 51.5, 7.5 53.5, 8.5 53.5, 8.5 51.5, 7.5 51.5))', location)",
    // "/test/v1.0/Locations?$filter=st_crosses(geography'LINESTRING(7.5 51.5, 7.5 53.5)', location)",
    // "/test/v1.0/Locations?$filter=st_disjoint(geography'POLYGON((7.5 51.5, 7.5 53.5, 8.5 53.5, 8.5 51.5, 7.5 51.5))', location)",
    // "/test/v1.0/Locations?$filter=st_equals(location, geography'POINT(8 53)')",
    // "/test/v1.0/Locations?$filter=st_intersects(location, geography'LINESTRING(7.5 51, 7.5 54)')",
    // "/test/v1.0/Locations?$filter=st_overlaps(geography'POLYGON((7.5 51.5, 7.5 53.5, 8.5 53.5, 8.5 51.5, 7.5 51.5))', location)",
    // "/test/v1.0/Locations?$filter=st_relate(geography'POLYGON((7.5 51.5, 7.5 53.5, 8.5 53.5, 8.5 51.5, 7.5 51.5))', location, 'T********')",
    // "/test/v1.0/Locations?$filter=st_touches(geography'POLYGON((8 53, 7.5 54.5, 8.5 54.5, 8 53))', location)",
    // "/test/v1.0/Locations?$filter=st_within(geography'POINT(7.5 52.75)', location)",
    // "/test/v1.0/Observations?$filter=validTime gt 2016-01-02T01:01:01.000Z/2016-01-03T23:59:59.999Z sub duration'P1D'"
];
describe("Various tests", () => {
    tests.forEach((test: string) => {
        it(test, (done) => {
            chai.request(server)
                .get(test)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal("application/json");
                    done();
                });
        });

    });
});


