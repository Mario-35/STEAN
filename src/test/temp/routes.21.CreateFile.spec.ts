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
import { IApiDoc, IApiInput, prepareToApiDoc, identification, keyTokenName, limitResult, generateApiDoc, testVersion, _RAWDB } from "./constant";

import { server } from "../../server/index";
import { Ientity } from "../../server/types";
import { executeQuery } from "./executeQuery";

chai.use(chaiHttp);

const should = chai.should();

const docs: IApiDoc[] = [];
const entity: Ientity = _RAWDB.CreateFile;


const addToApiDoc = (input: IApiInput) => {
    docs.push(prepareToApiDoc(input, "CreateFile"));
};

addToApiDoc({
    api: `{infos} /Import Infos.`,
    apiName: "InfosCreateFile",
    apiDescription: `<hr>
    <div class="text">
      <p>
      You can import a csv file as an observations.
      with one or multiple columns
      </p>
    </div>`,
    result: ""
});

describe(`CSV ${entity.name}`, function () {
    this.timeout(5000);
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

    it("Should return The Datastreams create to ingest csv file", (done) => {
        const infos:Iinfos  = {
            api: `{post} CreateFile with csv attached file`,
            apiName: "CreateFilePost",
            apiDescription: "Import csv file",
            apiExample: { http: `/${testVersion}/Things(22)/CreateFile` }
        };

        chai.request(server)
            .post(`/test/${infos.url}`)
            .field("Content-Type", "multipart/form-data")
            .field("method", "POST")
            .field("nb", "1")
            .attach("file", "./src/test/integration/files/file.csv")
            .set("Cookie", `${keyTokenName}=${token}`)
            .end(async (err: Error, res: any) => {                
                if (err) console.log(err);
                else {
                    should.not.exist(err);
                    res.should.have.status(201);
                    res.body["@iot.id"].should.eql(16);
                    await executeQuery(`SELECT count(*)::int FROM ${_RAWDB.Observations.table} WHERE "datastream_id"=16`).then((test) => {
                        test["count"].should.eql(25);
                        addToApiDoc({ ...infos, result: limitResult(res) });
                        done();
                    })
                    .catch((err) => console.log(err));

                }
            });
    });

    it("Should return The Datastreams updated for file", (done) => {
        const infos:Iinfos  = {
            api: `{post} CreateFile with same csv attached file [duplicate]`,
            apiName: "CreateFilePostDuplicate",
            apiDescription: "Import csv file [duplicate]",
            apiExample: { http: `/${testVersion}/Things(22)/CreateFile` },
        };

        chai.request(server)
            .post(`/test${infos.apiExample.http}`)
            .field("Content-Type", "multipart/form-data")
            .field("method", "POST")
            .field("nb", "22")
            .attach("file", "./src/test/integration/files/duplicates/file.csv")
            .set("Cookie", `${keyTokenName}=${token}`)
            .end(async (err: Error, res: any) => {
                console.log(res.body);
                
                if (err) console.log(err);
                else {
                    should.not.exist(err);
                    res.should.have.status(201);
                    res.body["@iot.id"].should.eql(16);
                    executeQuery(`SELECT count(*)::int FROM "${_RAWDB.Observations.table}" WHERE "datastream_id" = 16`).then((test) => {
                        test["count"].should.eql(24);
                        addToApiDoc({ ...infos, result: limitResult(res) });
                        generateApiDoc(docs, `apiDoc${entity.name}.js`);
                        done();
                    })
                    .catch((err) => console.log(err));
                }
            });
            
    });

});
