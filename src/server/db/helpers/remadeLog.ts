import * as fs from 'fs';
import { Knex } from 'knex';
import { serverConfig } from '../../configuration';
import { ADMIN } from '../../constants';

// const events = require('events');
const readline = require('readline');

export const remadeLog = async (): Promise<string> => {
    console.log("============================> start");
    let queries: string[] = [];
    const createTable = `CREATE TABLE public.log_request (
        id int8 NOT NULL, -- A unique bigSerial.
        "date" timestamptz NULL DEFAULT CURRENT_TIMESTAMP, -- The time of the operation.
        user_id int8 NULL, -- User id.
        "method" text NULL, -- Method of request.
        code int4 NULL, -- code return.
        url text NOT NULL, -- Url of the request.
        datas jsonb NULL, -- Datas send.
        port int4 NULL, -- port.
        "database" text NULL, -- database.
        "return" text NULL, -- result / error receive.
        error text NULL, -- Error message.
        replayid int8 NULL,
        entityid int8 NULL
    );`;


        serverConfig.db(ADMIN).transaction(async (tx: Knex.Transaction) => {
            let nbline = 0;
            const cleanup = (valid: boolean, err?: unknown) => {
                if (valid == true) tx.commit;
                else tx.rollback;
            };
            
            const client = await tx.client.acquireConnection().catch((err: Error) => {return err;});
            
            await client.query('DROP table public.log_request;');
            await client.query(createTable);

            let query = "";
                const rl = readline.createInterface({
                    input: fs.createReadStream(__dirname +'/logs.sql'),
                    crlfDelay: Infinity
                });
        
            rl.on('line', async (line: string) => {  
                if (line.includes("INSERT INTO public") && query !== "") {
                    if (query.includes(", 'lora', ") || query.includes(", 'rennesmetro', ") || query.includes(", 'rennesmetropole',")) queries.push(query); 
                    nbline += 1;
                    query = line;
                    if (queries.length > 100) {
                        // process.stdout.write(".");
                        
                        rl.pause();   
                        queries.push("COMMIT;");
                         await client.query(queries.join(""));
                        queries = [];
                        rl.resume();                    
                    }                  
                } else query += line;
            }) .on('close', async () => {
                console.log("=====================close==============================");
                cleanup(true);
            }) .on('error', async (error: unknown) => {
                console.log("=====================error==============================");
                console.log(error);
                console.log(nbline);
                process.exit(111);
                
                
            });
            
        });
    return "ok";


};