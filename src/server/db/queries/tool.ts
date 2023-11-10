import * as fs from 'fs';
import koa from 'koa';
import { serverConfig } from '../../configuration';
import { asyncForEach } from '../../helpers';
import { Logs } from '../../logger';

// const events = require('events');
const readline = require('readline');

export const remadeLog = async (ctx: koa.Context): Promise<object> => {
    console.log("============================> start");
    // const createTable = `CREATE TABLE "log_request" (
        //     id int8 NOT NULL, -- A unique bigSerial.
    //     "date" timestamptz NULL DEFAULT CURRENT_TIMESTAMP, -- The time of the operation.
    //     user_id int8 NULL, -- User id.
    //     "method" text NULL, -- Method of request.
    //     code int4 NULL, -- code return.
    //     url text NOT NULL, -- Url of the request.
    //     datas jsonb NULL, -- Datas send.
    //     port int4 NULL, -- port.
    //     "database" text NULL, -- database.
    //     "return" text NULL, -- result / error receive.
    //     error text NULL, -- Error message.
    //     replayid int8 NULL,
    //     entityid int8 NULL
    // );`;
            
            // await serverConfig.db(ctx._config.name).raw('DROP table public.log_request;');
            // await serverConfig.db(ctx._config.name).raw(`CREATE TABLE "log_request" ( "date" timestamptz NULL DEFAULT CURRENT_TIMESTAMP, -- The time of the operation. datas jsonb NULL );`);
            const files = {};
            await asyncForEach(Array(6).fill(0).map((_element, index) => index+71).map((e:number) => String(e)), async (e: string) => {
                console.log(`=====================Open /temp${e}.sql ==============================`);
                const rl = readline.createInterface({
                    input: fs.createReadStream(__dirname +`/temp${e}.sql`),
                    crlfDelay: Infinity
                });
            
                rl.on('line', async (line: string) => {
                    const date = line.split(",")[1];
                    const srch = line.includes("/v1.0/Lora', '") ? "/v1.0/Lora', '" : line.includes("/v1.0/Loras', '") ? "/v1.0/Loras', '" : undefined;
                    if (srch) {
                        const essai = line.split(srch)[1];                    
                        try {
                            if (essai.includes(`', `)) await serverConfig.db(ctx._config.name)`INSERT INTO public.log_request OVERRIDING SYSTEM VALUE VALUES (${date},'${essai.split(`', `)[0]}');`;
                            else {
                                console.log("=======================================");
                                console.log(essai);
                            }
                            
                        } catch (error) {
                            console.log("================== error =====================");
                            Logs.error(error);
                            console.log(line);
                            return;
                        }
                    }
                }) .on('close', async () => {
                    console.log(`=====================close /temp${e}.sql ==============================`);
                    files[`temp${e}.sql`] = "ok";
                    // fs.unlink(__dirname +`/temp${e}.sql`, (err) => {
                    //     if (err) {
                    //         throw err; }
                    //     console.log("Delete File successfully.");
                    // });
                }) .on('error', async (error: unknown) => {
                    console.log(`=====================error /temp${e}.sql ==============================`);
                    Logs.error(error);
                });

            });
            return files;


};