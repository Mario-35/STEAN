process.env.NODE_ENV = "test";

import chai from "chai";
import chaiHttp from "chai-http";
import fs from "fs";
import path from "path";
import { IApiDoc, prepareToApiDoc, IApiInput, identification, generateApiDoc, testVersion, _RAWDB, Iinfos } from "./constant";

chai.use(chaiHttp);

const should = chai.should();

import { server } from "../../server/index";
import { addGetTest, addStartNewTest } from "./tests";

const docs: IApiDoc[] = [];

const addToApiDoc = (input: IApiInput) => {
    docs.push(prepareToApiDoc(input, "Token"));
};

fs.mkdirSync(path.resolve(__dirname, "../server/apiDocs/"), {
    recursive: true
});

addToApiDoc({
    api: `{infos} /Identification Infos`,
    apiName: `InfosToken`,
    apiDescription: `<hr>
    <div class="text">
      <p>You have to be registered to be able to POST PUT OR DELETE datas.</p>
      </div>`,
      result: ""
    });
    
    describe("Identification : Token", () => {
        describe("GET a token", () => {
            it("should return JWT Identification", (done) => {            
            const infos:Iinfos  = {
                api: `{post} login get a new token`,
                url: `/${testVersion}/login`,
                apiName: `TokenLogin`,
                apiDescription: "Get a new token.",
                apiExample: {
                    http: `/test`,
                    curl: `curl -X POST KEYHTTP/login -H 'cache-control: no-cache' -H 'content-type: application/x-www-form-urlencoded' -d 'username=sensorapi&password=mario29'`
                },
                apiParamExample: { "username": "myUserName", "password": "*************" }
            };
            chai.request(server)
                .post(`/test/${infos.url}`)
                .type("form")
                .send(identification)
                .end((err: Error, res: any) => {
					addStartNewTest("Token");
                    should.not.exist(err);
                    res.body.should.include.keys("token");
                    res.body.should.include.keys("message");
                    res.body.message.should.eql("Login succeeded");
                    res.status.should.equal(200);
                    addToApiDoc({ ...infos, result: res });
					addGetTest(infos);
                    done();
                });
        });
        it("Return Error if the identification wrong", (done) => {
            const infos:Iinfos  = {
                url: `/${testVersion}/login`,
                api: `{post} login Post basic`,
                apiName: `TokenError`,
                apiDescription: "Identification failed.",
                apiExample: {
                    http: `/test`,
                    curl: `curl -X POST KEYHTTP/login -H 'cache-control: no-cache' -H 'content-type: application/x-www-form-urlencoded' -d 'username=sensorapi&password=mario9'`
                },
                apiParamExample: { "username": identification.username, "password": "nowhere" }
            };
            chai.request(server)
                .post(`/test/${infos.url}`)
                .type("form")
                .send(infos.apiParamExample)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.status.should.equal(401);
                    res.body.should.include.keys("message");
                    res.body.message.should.eql("Unauthorized");
                    const myError = JSON.stringify(res.body, null, 4);
                    docs[docs.length - 1].apiErrorExample = myError;
					addGetTest(infos);
                    done();
                });
        });
        it("should logout", (done) => {
            const infos:Iinfos  = {
                api: `{get} logout logout actual connection.`,
                url: `/${testVersion}/logout`,
                apiName: `TokenLogout`,
                apiDescription: "Logout actual connection.",
                apiExample: {
                    http: `/test`,
                    curl: `curl -X GET KEYHTTP/logout`
                }
            };
            chai.request(server)
                .get(`/test${infos.url}`)
                .end((err: Error, res: any) => {
                    should.not.exist(err);
                    res.body.should.include.keys("message");
                    res.body.message.should.eql("Logout succeeded");
                    res.status.should.equal(200);
                    addToApiDoc({ ...infos, result: res });
                    generateApiDoc(docs, `apiDocToken.js`);
					addGetTest(infos);
                    done();
                });
        });
    });
});
