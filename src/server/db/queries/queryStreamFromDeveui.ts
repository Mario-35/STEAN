/**
 * queryMultiDatastreamFromDeveui.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

export const queryStreamFromDeveui = ( input: string ): string => `with multidatastream as ( SELECT id as multidatastream, id, _default_foi, thing_id, (SELECT jsonb_agg(tmp.units -> 'name') AS keys FROM ( SELECT jsonb_array_elements("unitOfMeasurements") AS units ) AS tmp) FROM "multidatastream" WHERE "multidatastream".id = ( SELECT "lora"."multidatastream_id" FROM "lora" WHERE "lora"."deveui" = '${input}') ),
datastream as ( SELECT id as datastream, id, _default_foi, thing_id ,'{}'::jsonb as koys FROM "datastream" WHERE "datastream".id = (SELECT "lora"."datastream_id" FROM "lora" WHERE "lora"."deveui" = '${input}') )
select * from multidatastream UNION ALL SELECT * FROM  datastream`;
