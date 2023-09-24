/* eslint-disable @typescript-eslint/no-explicit-any */
process.env.NODE_ENV = "test";

import chai from "chai";
import chaiHttp from "chai-http";

chai.use(chaiHttp);

import { server } from "../../server/index";

const should = chai.should();


describe("Delete test Database", function () {
    it("Delete test Database", (done) => {
        chai.request(server)
        .get("/test/v1.0/removedbtestl")
        .end((err: Error, res: any) => {                 
                if (err) {
                    console.log(res.body);                    
                    console.error(err);
                }
                should.not.exist(err);
                res.status.should.equal(204);
                done();
            });
    });
});
