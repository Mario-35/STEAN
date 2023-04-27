/**
 * create Database for demo qnd apidoc.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

 const numberStr = ["one", "two", "three", "four", "five", "six", "seven", "height", "nine", "ten"];
  
 // Institut Agro Rennes-Angers 48.1140652783794, -1.7062956999598533 
 const geoPos: { [key: string]: number[] } = {
     "Centre commercial Grand Quartier" : [48.13765198324515, -1.6956051932646596],
     "Polyclinic Saint Laurent" : [48.139101133693764, -1.6571222811169917],
     "Golf municipal de Cesson-Sévigné": [48.12552590922048, -1.5889906727727678],
     "Glaz Arena": [48.11472599868096, -1.594679622929148],
     "Brin Herbe": [48.08416909630583, -1.601486946802519],
     "E.Leclerc VERN SUR SEICHE": [48.06467042196109, -1.623116279666956],
     "Écomusée du pays de Rennes": [48.07908248444603, -1.6664475955447595],
     "Castorama": [48.089982264765595, -1.7050636226736864],
     "The Mem": [48.089982264765595, -1.7050636226736864],
     "Kenedy": [48.123242161802274, -1.7127016234011674],
     "Institut Agro Rennes-Angers": [48.1140652783794, -1.7062956999598533 ]
 };
 const positions = Object.values(geoPos);
 
 
 const lora = (nb: number) => `8cf9574000002d${nb + 1}d`.toUpperCase();
 
 const featureofinterest = (nb: number) =>
     `WITH featureofinterest AS (
        INSERT INTO "featureofinterest" 
                     ("description", "encodingType", "feature", "name") 
                     values (
                        'This is the weather station Number ${ numberStr[nb] }',
                        'application/vnd.geo+json', 
                        '{"type":"Point","coordinates":["${positions[nb][0]}","${positions[nb][1]}"]}',
                         'Weather Station ${nb + 1}'
                    ) RETURNING *) SELECT * FROM featureofinterest;`;
 
 const sensor = (nb: number) =>
     `WITH sensor AS (INSERT INTO "sensor" ("description", "encodingType", "metadata", "name") values ('PM sensor Number ${
         numberStr[nb]
     }', 'application/pdf', 'http://particle-sensor.com/', 'PM ${nb + 1} sensor') RETURNING *)SELECT * FROM sensor;`;
 
 const thing = (nb: number) =>
     nb < 5
         ? `WITH thing AS (
            INSERT INTO "thing" 
            ("description", "name", "properties") 
            values (
                'A SensorThingWeb thing Number ${numberStr[nb]}', 
                'SensorWebThing ${ nb + 1 }', 
                '{"owner":"Mozilla version ${numberStr[nb]}","organization":"Mozilla"}'
           ) RETURNING *)SELECT * FROM thing;`
         : `WITH thing AS (
            INSERT INTO "thing" 
            ("description", "name", "properties") 
            values (
                'A SensorWeb thing Number ${numberStr[nb]}', 
                'SensorWebThing ${ nb + 1 }', 
                '{"owner":"Mozilla version ${ numberStr[nb] }","organization":"Mozilla"}'
            ) RETURNING *), 
            location1 AS (
                INSERT INTO "location" 
                ("description", "encodingType", "location", "name") 
                values (
                    '${Object.keys(geoPos)[nb]}', 
                    'application/vnd.geo+json', 
                    '{"type":"Point","coordinates":["${positions[nb][0]}","${positions[nb][1]}"]}', 
                    'UofC Number ${ numberStr[nb] }'
            ) RETURNING id), 
            thing_location AS (
                INSERT INTO "thing_location" 
                ("location_id", "thing_id")
                values (
                    (select location1.id from location1), 
                    (select thing.id from thing)
            ) RETURNING thing_id)SELECT * FROM thing;`;
 const thingMulti = (nb: number) =>
     `WITH thing AS (
        INSERT INTO "thing" 
        ("description", "name", "properties") 
        values ( 
            'A SensorWeb lora MultiDatastreams Number ${ numberStr[nb] }', 
            'MultiDatastreams SensorWebThing ${nb + 1}', 
            '{"essai":"${lora(nb)}","sensor_id":"zzz${lora( nb )}"}'
    ) RETURNING *), 
    location1 AS (
        INSERT INTO "location" 
        ("description", "encodingType", "location", "name") 
        values (
            '${Object.keys(geoPos)[nb]}', 
            'application/vnd.geo+json', 
            '{"type":"Point","coordinates":["${positions[nb][0]}","${positions[nb][1]}"]}', 
            'UofC (Created new location) for MultiDatastream Number ${numberStr[nb]}'
    )RETURNING id), 
    thing_location AS (
        INSERT INTO "thing_location" 
        ("location_id", "thing_id") 
        values (
            (select location1.id from location1),
             (select thing.id from thing)
    )RETURNING thing_id)SELECT * FROM thing;`;
 const observedproperty = (nb: number) =>
     `WITH observedproperty AS (
        INSERT INTO "observedproperty" 
        ("definition", "description", "name") 
        values (
            'https://airnow.gov/index.cfm?action=aqibasics.particle', 
            'PM something Number ${ numberStr[nb] }', 
            'PM ${nb + 1} observedProperties'
        ) RETURNING *) 
    SELECT * FROM observedproperty;`;
 const datastream = (nb: number) =>
     `WITH datastream AS (
        INSERT INTO "datastream" 
        ("description", "_default_foi","name", "observedproperty_id", "sensor_id", "thing_id", "unitOfMeasurement") 
        values (
            'Air quality Number ${ numberStr[nb] }',
            1, 
            'air_quality_readings${nb + 1}', 
            ${ ["3, 1, 4", "2, 1, 5", "2, 3, 5", "4, 3, 1", "3, 2, 2", "1, 3, 4", "1, 3, 1", "8, 5, 6", "8, 5, 6", "8, 5, 6"][nb] }, 
            '{"symbol":"μg/m³","name":"PM 2.5 Particulates (ug/m3)","definition":"http://unitsofmeasure.org/ucum.html"}'
    ) RETURNING *)SELECT * FROM datastream;`;
 const multiDatastream = (nb: number) =>
     `WITH multidatastream AS (
        INSERT INTO "multidatastream" 
        (
            "name", 
            "_default_foi",
            "description", 
            "sensor_id", 
            "thing_id", 
            "multiObservationDataTypes", 
            "unitOfMeasurements") 
        values (
            'air_quality_readings${nb + 1}', 
            2,
            'Air quality Number ${ numberStr[nb] }', 
            ${["3, 12", "1, 12", "3, 10", "3, 14", "3, 13", "4, 13", "1, 10", "5, 15", "5, 15", "5, 15"][nb]}, 
            '{"Measurement", "Measurement", "Measurement"}', 
            '[{"name":"Humidity","symbol":"%","definition":"http://unitsofmeasure.org/humidity.html"},{"name":"Temperature","symbol":"°","definition":"http://unitsofmeasure.org/temperature.html"},{"name":"Battery","symbol":"%","definition":"http://unitsofmeasure.org/percentage.html"}]'
    ) RETURNING *), 
    observedproperty3 AS (
        INSERT INTO "observedproperty" 
        ("name", "definition") 
        values (
            'Battery ${ numberStr[nb] }',
            'Battery'
    )RETURNING id), 
    observedproperty2 AS (
        INSERT INTO "observedproperty" 
        ("name", "definition") 
        values (
            'Temperature ${ numberStr[nb] }', 
            'Temperature'
    )RETURNING id), 
    observedproperty1 AS (
        INSERT INTO "observedproperty" 
        ("name", "definition") 
        values (
            'humidity ${ numberStr[nb] }', 
            'humidity'
    )RETURNING id), 
    multi_datastream_observedproperty AS (
        INSERT INTO "multi_datastream_observedproperty" 
        ("multidatastream_id", "observedproperty_id") 
        values (
            (select multidatastream.id from multidatastream), 
            (select observedproperty1.id from observedproperty1)
    )RETURNING multidatastream_id), 
    multi_datastream_observedproperty1 AS (
        INSERT INTO "multi_datastream_observedproperty" 
        ("multidatastream_id", "observedproperty_id") 
        values (
            (select multidatastream.id from multidatastream), 
            (select observedproperty3.id from observedproperty3)
    )RETURNING multidatastream_id)
    SELECT * FROM multidatastream;`;
 const loras = (nb: number) =>
     `WITH lora AS (
        INSERT INTO "lora" 
        (
            "description", 
            "name", 
            "multidatastream_id", 
            "deveui", 
            "decoder_id") 
        values (
            'Lora Number ${ numberStr[nb] }', 
            'Lora Number ${nb+1}', 
            ${[3, 1, 4, 5][nb]},
            '${lora( nb )}',
            1
    )RETURNING *) 
    SELECT * FROM lora;`;
 
 const datas = [
     `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "_resultnumber") values (1, 2, '2016-11-18T06:15:15.790Z','2016-11-18T06:15:15.790Z', '2016-11-18T18:30:30.790Z', '17.5') RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "_resultnumber") values (2, 1, '2016-11-18T03:15:15.790Z','2016-11-18T03:15:15.790Z', '2016-11-18T15:30:30.790Z', '11.666666666666666') RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "_resultnumber") values (3, 3, '2016-11-18T01:15:15.790Z','2016-11-18T01:15:15.790Z', '2016-11-18T11:30:30.790Z', '8.75') RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "_resultnumber") values (4, 1, '2016-11-18T08:15:15.790Z','2016-11-18T08:15:15.790Z', '2016-11-18T15:30:30.790Z', '17.5') RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "_resultnumber") values (1, 4, '2016-11-18T02:15:15.790Z','2016-11-18T02:15:15.790Z', '2016-11-18T15:30:30.790Z', '11.666666666666666') RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "_resultnumber") values (3, 4, '2016-11-18T05:15:15.790Z','2016-11-18T05:15:15.790Z', '2016-11-18T16:30:30.790Z', '8.75') RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "_resultnumber") values (2, 2, '2016-11-18T02:15:15.790Z','2016-11-18T02:15:15.790Z', '2016-11-18T18:30:30.790Z', '17.5') RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "_resultnumber") values (10, 4, '2016-11-18T02:15:15.790Z', '2016-11-18T02:15:15.790Z', '2016-11-18T17:30:30.790Z', '45') RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "_resultnumber") values (10, 1, '2016-11-18T07:15:15.790Z', '2016-11-18T07:15:15.790Z', '2016-11-18T18:30:30.790Z', '45') RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "_resultnumber") values (10, 2, '2016-11-18T02:15:15.790Z', '2016-11-18T02:15:15.790Z', '2016-11-18T18:30:30.790Z', '45') RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 2), 2) AS id), multidatastream1 AS (select coalesce((select "id" from "multidatastream" where "id" = 2), 2) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "_resultnumbers") values ((select featureofinterest1.id from featureofinterest1), (select multidatastream1.id from multidatastream1), '2016-11-18T01:15:15.790Z', '2016-11-18T12:30:30.790Z', '{"35","35","35"}')RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 2), 2) AS id), multidatastream1 AS (select coalesce((select "id" from "multidatastream" where "id" = 2), 2) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "_resultnumbers") values ((select featureofinterest1.id from featureofinterest1), (select multidatastream1.id from multidatastream1), '2016-11-18T04:15:15.790Z', '2016-11-18T14:30:30.790Z', '{"17.5","35","17.5"}')RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 4), 4) AS id), multidatastream1 AS (select coalesce((select "id" from "multidatastream" where "id" = 1), 1) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "_resultnumbers") values ((select featureofinterest1.id from featureofinterest1), (select multidatastream1.id from multidatastream1), '2016-11-18T03:15:15.790Z', '2016-11-18T15:30:30.790Z', '{"8.75","17.5","8.75"}')RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 3), 3) AS id), multidatastream1 AS (select coalesce((select "id" from "multidatastream" where "id" = 4), 4) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "_resultnumbers") values ((select featureofinterest1.id from featureofinterest1), (select multidatastream1.id from multidatastream1), '2016-11-18T06:15:15.790Z', '2016-11-18T11:30:30.790Z', '{"8.75","11.666666666666666","17.5"}')RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 1), 1) AS id), multidatastream1 AS (select coalesce((select "id" from "multidatastream" where "id" = 1), 1) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "_resultnumbers") values ((select featureofinterest1.id from featureofinterest1), (select multidatastream1.id from multidatastream1), '2016-11-18T06:15:15.790Z', '2016-11-18T12:30:30.790Z', '{"17.5","35","35"}')RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 3), 3) AS id), multidatastream1 AS (select coalesce((select "id" from "multidatastream" where "id" = 1), 1) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "_resultnumbers") values ((select featureofinterest1.id from featureofinterest1), (select multidatastream1.id from multidatastream1), '2016-11-18T08:15:15.790Z', '2016-11-18T14:30:30.790Z', '{"35","17.5","11.666666666666666"}')RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 2), 2) AS id), multidatastream1 AS (select coalesce((select "id" from "multidatastream" where "id" = 4), 4) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "_resultnumbers") values ((select featureofinterest1.id from featureofinterest1), (select multidatastream1.id from multidatastream1), '2016-11-18T03:15:15.790Z', '2016-11-18T12:30:30.790Z', '{"11.666666666666666","17.5","11.666666666666666"}')RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 3), 3) AS id), multidatastream1 AS (select coalesce((select "id" from "multidatastream" where "id" = 10), 10) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "_resultnumbers") values ((select featureofinterest1.id from featureofinterest1), (select multidatastream1.id from multidatastream1), '2016-11-18T05:15:15.790Z', '2016-11-18T13:30:30.790Z', '{"45","50","55"}')RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 4), 4) AS id), multidatastream1 AS (select coalesce((select "id" from "multidatastream" where "id" = 10), 10) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "_resultnumbers") values ((select featureofinterest1.id from featureofinterest1), (select multidatastream1.id from multidatastream1), '2016-11-18T02:15:15.790Z', '2016-11-18T15:30:30.790Z', '{"45","50","55"}')RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 1), 1) AS id), multidatastream1 AS (select coalesce((select "id" from "multidatastream" where "id" = 10), 10) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "_resultnumbers") values ((select featureofinterest1.id from featureofinterest1), (select multidatastream1.id from multidatastream1), '2016-11-18T07:15:15.790Z', '2016-11-18T17:30:30.790Z', '{"45","50","55"}')RETURNING *, _resultnumber AS result)SELECT * FROM observation;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), thing1 AS (select coalesce((select "id" from "thing" where "id" = 5), 5) AS id), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 4), 4) AS id), location AS (INSERT INTO "location" ("description", "encodingType", "location", "name") values ('${Object.keys(geoPos)[6]}', 'application/vnd.geo+json', '{"type":"Point","coordinates":["${positions[6][0]}","${positions[6][1]}"]}', 'My Location 6')RETURNING *), thing_location AS (INSERT INTO "thing_location" ("location_id", "thing_id") values ((select location.id from location), (select thing1.id from thing1))RETURNING thing_id)SELECT * FROM location;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), thing1 AS (select coalesce((select "id" from "thing" where "id" = 5), 5) AS id), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 1), 1) AS id), location AS (INSERT INTO "location" ("description", "encodingType", "location", "name") values ('${Object.keys(geoPos)[7]}', 'application/vnd.geo+json', '{"type":"Point","coordinates":["${positions[7][0]}","${positions[7][1]}"]}', 'My Location 7')RETURNING *), thing_location AS (INSERT INTO "thing_location" ("location_id", "thing_id") values ((select location.id from location), (select thing1.id from thing1))RETURNING thing_id)SELECT * FROM location;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), thing1 AS (select coalesce((select "id" from "thing" where "id" = 5), 5) AS id), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 3), 3) AS id), location AS (INSERT INTO "location" ("description", "encodingType", "location", "name") values ('${Object.keys(geoPos)[8]}', 'application/vnd.geo+json', '{"type":"Point","coordinates":["${positions[8][0]}","${positions[8][1]}"]}', 'My Location 8')RETURNING *), thing_location AS (INSERT INTO "thing_location" ("location_id", "thing_id") values ((select location.id from location), (select thing1.id from thing1))RETURNING thing_id)SELECT * FROM location;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), thing1 AS (select coalesce((select "id" from "thing" where "id" = 5), 5) AS id), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 4), 4) AS id), location AS (INSERT INTO "location" ("description", "encodingType", "location", "name") values ('${Object.keys(geoPos)[9]}', 'application/vnd.geo+json', '{"type":"Point","coordinates":["${positions[9][0]}","${positions[9][1]}"]}', 'My Location 9')RETURNING *), thing_location AS (INSERT INTO "thing_location" ("location_id", "thing_id") values ((select location.id from location), (select thing1.id from thing1))RETURNING thing_id)SELECT * FROM location;`,
     `WITH "log_request" as (select srid FROM "spatial_ref_sys" LIMIT 1), thing1 AS (select coalesce((select "id" from "thing" where "id" = 5), 5) AS id), featureofinterest1 AS (select coalesce((select "id" from "featureofinterest" where "id" = 1), 1) AS id), location AS (INSERT INTO "location" ("description", "encodingType", "location", "name") values ('${Object.keys(geoPos)[10]}', 'application/vnd.geo+json', '{"type":"Point","coordinates":["${positions[10][0]}","${positions[10][1]}"]}', 'My Location 10')RETURNING *), thing_location AS (INSERT INTO "thing_location" ("location_id", "thing_id") values ((select location.id from location), (select thing1.id from thing1))RETURNING thing_id)SELECT * FROM location;`,
     `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (2, '2014-12-11T14:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
     `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (2, '2014-12-21T12:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
     `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (7, '2014-12-21T16:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
     `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (2, '2014-12-11T17:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
     `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (7, '2014-12-11T17:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
     `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (5, '2014-12-11T16:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
     `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (1, '2014-12-21T15:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
     `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (4, '2014-12-11T15:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
     `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (6, '2014-12-21T15:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
     `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (7, '2014-12-11T13:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`
 ];
 
 export const testsDatas = (): string[] => {
     const result: string[] = [    
     `WITH decoder AS (INSERT INTO "decoder" ("name", "description", "code", "test", "nomenclature") VALUES ('RHF1S001', 'no description',  'function decode(e,t){"string"==typeof e&&(e=e.match(/.{1,2}/g));const a={valid:!0,err:0,payload:e,messages:[]};return null==e||"01"!=e[0]&&"81"!=e[0]?(a.valid=!1,a.err=-1,a):(a.messages.push({type:"report_telemetry",measurementName:t["0610"],measurementValue:175.72*parseInt(String(e[2])+String(e[1]),16)/65536-46.85}),a.messages.push({type:"report_telemetry",measurementName:t["0710"],measurementValue:125*parseInt(e[3],16)/256-6}),a.messages.push({type:"upload_battery",measurementName:t.period,measurementValue:2*parseInt(String(e[5])+String(e[4]),16)}),a.messages.push({type:"upload_battery",measurementName:t.voltage,measurementValue:.01*(parseInt(e[8],16)+150)}),a)}', '012f5ecec2014a1ab2', '{"0110": "air temperature", "0210": "air humidity", "0310": "light intensity", "0410": "humidity", "0510": "barometric pressure", "0610": "soil temperature", "0700": "battery", "0710": "soil moisture", "period": "periods", "voltage": "battery voltage"}') RETURNING *)SELECT * FROM decoder;`,
     `WITH decoder AS (INSERT INTO "decoder" ("name", "description", "properties", "code", "test", "nomenclature", "synonym") VALUES  ('Sensecap', 'no description', '{"repository": "https://github.com/Seeed-Solution"}', 'function decode(r,e){function t(r){for(var e=[],t=0;t<r.length;t+=2)e.push(r.substring(t,t+2));return e.reverse(),e}function s(r){var e=t(r);return parseInt(e.toString().replace(/,/g,""),16)}function a(r){switch(r){case 0:case 1:case 2:case 3:case 4:case 7:case 288:return!0;default:return!1}}function n(r,e){var s=t(e);if(2===r||3===r)return s.join("");var a=o(s),n=[];switch(r){case 0:case 1:for(var u=0;u<a.length;u+=16){var i=a.substring(u,u+16);i=(parseInt(i.substring(0,8),2)||0)+"."+(parseInt(i.substring(8,16),2)||0),n.push(i)}return n.join(",");case 4:for(var p=0;p<a.length;p+=8){var g=parseInt(a.substring(p,p+8),2);g=g<10?"0"+g.toString():g.toString(),n.push(g)}return n.join("");case 7:return{interval:parseInt(a.substr(0,16),2),power:parseInt(a.substr(-16,16),2)}}}function u(r){var e=o(t(r));if("1"===e.substring(0,1)){for(var s=e.split(""),a=[],n=0;n<s.length;n++){var u=s[n];1===parseInt(u)?a.push(0):a.push(1)}return e=parseInt(a.join(""),2)+1,parseFloat("-"+e/1e3)}return parseInt(e,2)/1e3}function i(r){var e=r.split(",");return{ver_hardware:e[0],ver_software:e[1]}}function o(r){for(var e=[],t=0;t<r.length;t++){var s=r[t],a=parseInt(s,16).toString(2),n=a.length;if(8!==a.length)for(var u=0;u<8-n;u++)a="0"+a;e.push(a)}return e.toString().replace(/,/g,"")}return function(r,t){"string"==typeof r&&(r=r.match(/.{1,2}/g));var o,p,g=function(r){for(var e="",t=0;t<r.length;t++){var s,a=r[t];1===(s=a<0?(255+a+1).toString(16):a.toString(16)).length&&(s="0"+s),e+=s}return e}(r).toLocaleUpperCase(),l={valid:!0,err:0,payload:g,messages:[]};if(!function(r){for(var e=[0,4489,8978,12955,17956,22445,25910,29887,35912,40385,44890,48851,51820,56293,59774,63735,4225,264,13203,8730,22181,18220,30135,25662,40137,36160,49115,44626,56045,52068,63999,59510,8450,12427,528,5017,26406,30383,17460,21949,44362,48323,36440,40913,60270,64231,51324,55797,12675,8202,4753,792,30631,26158,21685,17724,48587,44098,40665,36688,64495,60006,55549,51572,16900,21389,24854,28831,1056,5545,10034,14011,52812,57285,60766,64727,34920,39393,43898,47859,21125,17164,29079,24606,5281,1320,14259,9786,57037,53060,64991,60502,39145,35168,48123,43634,25350,29327,16404,20893,9506,13483,1584,6073,61262,65223,52316,56789,43370,47331,35448,39921,29575,25102,20629,16668,13731,9258,5809,1848,65487,60998,56541,52564,47595,43106,39673,35696,33800,38273,42778,46739,49708,54181,57662,61623,2112,6601,11090,15067,20068,24557,28022,31999,38025,34048,47003,42514,53933,49956,61887,57398,6337,2376,15315,10842,24293,20332,32247,27774,42250,46211,34328,38801,58158,62119,49212,53685,10562,14539,2640,7129,28518,32495,19572,24061,46475,41986,38553,34576,62383,57894,53437,49460,14787,10314,6865,2904,32743,28270,23797,19836,50700,55173,58654,62615,32808,37281,41786,45747,19012,23501,26966,30943,3168,7657,12146,16123,54925,50948,62879,58390,37033,33056,46011,41522,23237,19276,31191,26718,7393,3432,16371,11898,59150,63111,50204,54677,41258,45219,33336,37809,27462,31439,18516,23005,11618,15595,3696,8185,63375,58886,54429,50452,45483,40994,37561,33584,31687,27214,22741,18780,15843,11370,7921,3960],t=!1,s=0,a=[],n=0;n<r.length;n+=2)a.push(r.substring(n,n+2));for(var u=0;u<a.length;u++){var i=a[u];s=s>>8^e[255&(s^parseInt(i,16))]}0===s&&(t=!0);return t}(g))return l.valid=!1,l.err=-1,l;if((g.length/2-2)%7!=0)return l.valid=!1,l.err=-2,l;for(var v=function(r){for(var e=[],t=0;t<r.length-4;t+=14){var s=r.substring(t,t+14);e.push(s)}return e}(g),c=0;c<v.length;c++){var f=v[c],h=(s(f.substring(0,2)),s(f.substring(2,6))),b=f.substring(6,14),d=a(h)?n(h,b):u(b);if(parseInt(h)>4096)l.messages.push({type:"report_telemetry",measurementId:h,measurementName:e[String(h)],measurementValue:d});else if(a(h)||5===h||6===h)switch(h){case 0:var m=i(d);l.messages.push({type:"upload_version",hardwareVersion:m.ver_hardware,softwareVersion:m.ver_software});break;case 1:default:break;case 2:o=d;break;case 3:p=d;break;case 7:l.messages.push({type:"upload_battery",battery:d.power},{type:"upload_interval",interval:60*parseInt(d.interval)});break;case 288:l.messages.push({type:"report_remove_sensor",channel:1})}else l.messages.push({type:"unknown_message",dataID:h,dataValue:b})}return p&&o&&l.messages.unshift({type:"upload_sensor_id",channel:1,sensorId:(p+o).toUpperCase()}),l}(r)}', '0106105d1b00000107100aa50000606f', '{"4097": "Air Temperature", "4098": "Air Humidity", "4099": "Light Intensity", "4100": "CO2", "4101": "Barometric Pressure", "4102": "Soil Temperature", "4103": "Soil Moisture", "4104": "Wind Direction", "4105": "Wind Speed", "4106": "pH", "4107": "Light Quantum", "4108": "Electrical Conductivity", "4109": "Dissolved Oxygen", "4110": "Soil Volumetric Water Content", "4113": "Rainfall Hourly", "4115": "Distance", "4116": "Water Leak", "4117": "Liguid Level", "4118": "NH3", "4119": "H2S", "4120": "Flow Rate", "4121": "Total Flow", "4122": "Oxygen Concentration", "4123": "Water Eletrical Conductivity", "4124": "Water Temperature", "4125": "Soil Heat Flux", "4126": "Sunshine Duration", "4127": "Total Solar Radiation", "4128": "Water Surface Evaporation", "4129": "Photosynthetically Active Radiation(PAR)", "4130": "Accelerometer", "4131": "Sound Intensity", "4133": "Soil Tension", "4134": "Salinity", "4135": "TDS", "4136": "Leaf Temperature", "4137": "Leaf Wetness", "4138": "Soil Moisture-10cm", "4139": "Soil Moisture-20cm", "4140": "Soil Moisture-30cm", "4141": "Soil Moisture-40cm", "4142": "Soil Temperature-10cm", "4143": "Soil Temperature-20cm", "4144": "Soil Temperature-30cm", "4145": "Soil Temperature-40cm", "4146": "PM2.5", "4147": "PM10", "4148": "Noise", "4150": "AccelerometerX", "4151": "AccelerometerY", "4152": "AccelerometerZ", "4157": "Ammonia ion", "4165": "Measurement1", "4166": "Measurement2", "4167": "Measurement3", "4168": "Measurement4", "4169": "Measurement5", "4170": "Measurement6", "4171": "Measurement7", "4172": "Measurement8", "4173": "Measurement9", "4174": "Measurement10", "4175": "AI Detection No.01", "4176": "AI Detection No.02", "4177": "AI Detection No.03", "4178": "AI Detection No.04", "4179": "AI Detection No.05", "4180": "AI Detection No.06", "4181": "AI Detection No.07", "4182": "AI Detection No.08", "4183": "AI Detection No.09", "4184": "AI Detection No.10", "4190": "UV Index", "4191": "Peak Wind Gust", "4192": "Sound Intensity", "4193": "Light Intensity", "4195": "TVOC", "4196": "Soil moisture intensity", "5100": "Switch"}', '{"Soil Moisture": ["humide", "humidity"], "soil temperature": ["temperature"]}') RETURNING *) SELECT * FROM decoder;`,
     `WITH decoder AS (INSERT INTO "decoder" ("name", "description", "code", "test") VALUES  ('Watteco', 'no description', 'function decode(e){"string"==typeof e&&(e=Buffer.from(e,"hex"));var t={valid:!1,payload:"",messages:[]};for(var r=e.length,a="",d=0;d<r;d++){1==(a=e[d].toString(16).toUpperCase()).length&&(a="0"+a),t.payload+=a;var n=new Date;t.date=n.toISOString()}return!1==!(1&e[0])&&(attributID=-1,cmdID=-1,clusterdID=-1,cmdID=e[1],clusterdID=256*e[2]+e[3],10===cmdID|138===cmdID|1===cmdID&&(attributID=256*e[4]+e[5],10===cmdID|138===cmdID&&(index=7),1===cmdID&&(index=8),12===clusterdID&85===attributID&&t.messages.push({type:"analog",measurementName:"analog",measurementValue:function(e){var t=2147483648&e?-1:1,r=(e>>23&255)-127,a=8388607&e;if(128==r)return t*(a?Number.NaN:Number.POSITIVE_INFINITY);if(-127==r){if(0==a)return 0*t;r=-126,a/=1<<22}else a=(a|1<<23)/(1<<23);return t*a*Math.pow(2,r)}(256*e[index]*256*256+256*e[index+1]*256+256*e[index+2]+e[index+3])}))),t.valid=!0,t}', '110A000C00553940C39A35') RETURNING *)SELECT * FROM decoder;`,
    ];
    try {
    
     for (let i = 0; i < 5; i++) {
         result.push(featureofinterest(i));
     }
     result.push("COMMIT;");
 
     for (let i = 0; i < 7; i++) {
         result.push(sensor(i));
     }
     result.push("COMMIT;");
 
     for (let i = 0; i < 10; i++) {
         result.push(thing(i));
     }
     result.push("COMMIT;");
 
     for (let i = 0; i < 10; i++) {
         result.push(thingMulti(i));
     }
     result.push("COMMIT;");
     for (let i = 0; i < 10; i++) {
         result.push(observedproperty(i));
     }
     result.push("COMMIT;");
 
     for (let i = 0; i < 10; i++) {
         result.push(datastream(i));
     }
     result.push("COMMIT;");
 
     for (let i = 0; i < 10; i++) {
         result.push(multiDatastream(i));
     }
     result.push("COMMIT;");
 
     for (let i = 0; i < 4; i++) {
         result.push(loras(i));
     }
     result.push("COMMIT;");
 
     datas.forEach((elem: string) => result.push(elem));
     result.push("COMMIT;");
    } catch (error) {
     console.log(error);
        
    } finally {
        return result;
        
    }    
 };
 