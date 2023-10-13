/**
 * tool.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */


import { serverConfig } from "../../configuration";
import koa from "koa";

export const tool = async(ctx: koa.Context) =>
{
    let i = 0;
    const step = 5000;
    const nb = await serverConfig.db(ctx._config.name).raw("select count(*) FROM observation");
    const max = +nb.rows[0].count;
       
    for (i; i <= max; i += step) {
        // const sql = `
        // UPDATE observation 
        // SET result = a.result
        // FROM (
        // select
        // BTRIM(split_part(split_part(return::TEXT,'"@iot.id": ',2)::TEXT,',',1)::TEXT,'"')::int as obsid,
        // json_build_object(
        // 'logid', id,
        // 'date', date,
        // 'devui',BTRIM(coalesce(datas->'deveui', datas->'DevEUI')::TEXT,'"'),
        // 'payload',BTRIM(coalesce(datas->'frame', datas->'payload_deciphered')::TEXT,'"'),
        // 'datas',
        // CASE 
        //       WHEN datas->'data'->'error' isnull THEN datas->'data'
        //       ELSE null
        // END
        // ) as result
        // from
        // dblink('dbname=admin','select id,date,datas, return from log_request where code = 201 and id <= ${i} and id < ${i + step}') as t1(id int, date timestamptz, datas jsonb, return text)
        // ) a
        // WHERE a.obsid = observation.id            
        // `;

        // const temp = await serverConfig.db(ctx._config.name).raw(sql);        
        // console.log(temp);
        
        console.log(`id <= ${i} and id < ${i + step}`);
    }
    return "ok";
};


