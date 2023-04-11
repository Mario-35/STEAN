/**
 * TDD for ultime tests API.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
process.env.NODE_ENV = "test";

import chai from "chai";
import chaiHttp from "chai-http";
import { IApiDoc, IApiInput, prepareToApiDoc, identification, keyTokenName, limitResult } from "./constant";

import { server } from "../../server/index";
import { dbTest } from "../dbTest";
import { _DBDATAS } from "../../server/db/constants";

chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];



const addToApiDoc = (input: IApiInput) => {
    docs.push(prepareToApiDoc(input, "resultFile"));
};

addToApiDoc({
    api: `{infos} /Import Infos.`,
    apiName: "InfosResultFile",
    apiDescription: `<hr>
    <div class="text">
      <p>
      You can import a csv file in observations. with one or multiple columns
      </p>
    </div>`,
    result: ""
});

describe("CSV Import", function () {
    this.timeout(5000);
    let token = "";
    before((done) => {        
        chai.request(server)
            .post("/test/v1.0/login")
            .send(identification)
            .end((err: any, res: any) => {
                token = String(res.body["token"]);
                done();
            });
    });

    it("should return 25 observations added from csv file", (done) => {
        const infos = {
            api: `{post} CreateFile with multi csv attached file`,
            apiName: "PostImportCreateFile",
            apiDescription: "Import csv file",
            apiExample: { http: "/v1.0/Things(22)/CreateFile" }
        };

        chai.request(server)
            .post(`/test${infos.apiExample.http}`)
            .field("Content-Type", "multipart/form-data")
            .field("method", "POST")
            .field("nb", "1")
            .attach("file", "./src/test/integration/files/file.csv")
            .set("Cookie", `${keyTokenName}=${token}`)
            .end((err: any, res: any) => {
                if (err) console.log(err);
                else {
                    should.not.exist(err);
                    res.should.have.status(201);
                    res.body["@iot.id"].should.eql(14);
                    // res.body["observationType"].should.eql('http://www.opengis.net/def/observation-type/ogc-omxml/2.0/swe-array-observation');

                    dbTest(_DBDATAS.Observations.table)
                        .where("datastream_id", 14)
                        .orderBy("id")
                        .then((test) => {
                            test.length.should.eql(25);                            
                            test[0]["_resultjson"]["annee"].should.eql('2010');
                            addToApiDoc({ ...infos, result: limitResult(res) });
                            done();
                        })
                        .catch((err) => console.log(err));

                }
            });
    });

    it("should return 24 observations added from csv file", (done) => {
        const infos = {
            api: `{post} CreateFile with multi csv attached file [duplicate]`,
            apiName: "PostImportCreateFileDuplicate",
            apiDescription: "Import csv file [duplicate]",
            apiExample: { http: "/v1.0/Things(22)/CreateFile" },
        };

        chai.request(server)
            .post(`/test${infos.apiExample.http}`)
            .field("Content-Type", "multipart/form-data")
            .field("method", "POST")
            .field("nb", "22")
            .attach("file", "./src/test/integration/files/duplicates/file.csv")
            .set("Cookie", `${keyTokenName}=${token}`)
            .end((err: any, res: any) => {
                if (err) console.log(err);
                else {
                    should.not.exist(err);
                    res.should.have.status(201);
                    res.body["@iot.id"].should.eql(14);
                    dbTest(_DBDATAS.Observations.table)
                        .where("datastream_id", 14)
                        .orderBy("id")
                        .then((test) => {
                            test.length.should.eql(24);
                            test[0]["_resultjson"]["annee"].should.eql('2020');
                            addToApiDoc({ ...infos, result: limitResult(res) });
                            done();
                        })
                        .catch((err) => console.log(err));
                }
            });
    });

});
