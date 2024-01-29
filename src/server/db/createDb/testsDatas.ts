/**
 * create Database for demo qnd apidoc.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { log } from "../../log";

const numberStr = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "height",
    "nine",
    "ten",
  ];
  
  const decoders = {
    rhf1s001:
      process.env.NODE_ENV === "test"
        ? require("../../../../sandbox/loras/RHF1S001.js")
        : null,
    senscap:
      process.env.NODE_ENV === "test"
        ? require("../../../../sandbox/loras/Sensecap.js")
        : null,
    wattEco:
      process.env.NODE_ENV === "test"
        ? require("../../../../sandbox/loras/WattEco.js")
        : null,
  };
  
  // Institut Agro Rennes-Angers 48.1140652783794, -1.7062956999598533
  const geoPos: { [key: string]: number[] } = {
    "Centre commercial Grand Quartier": [48.13765198324515, -1.6956051932646596],
    "Polyclinic Saint Laurent": [48.139101133693764, -1.6571222811169917],
    "Golf municipal de Cesson-Sévigné": [48.12552590922048, -1.5889906727727678],
    "Glaz Arena": [48.11472599868096, -1.594679622929148],
    "Brin Herbe": [48.08416909630583, -1.601486946802519],
    "E.Leclerc VERN SUR SEICHE": [48.06467042196109, -1.623116279666956],
    "Écomusée du pays de Rennes": [48.07908248444603, -1.6664475955447595],
    Castorama: [48.089982264765595, -1.7050636226736864],
    "The Mem": [48.089982264765595, -1.7050636226736864],
    Kenedy: [48.123242161802274, -1.7127016234011674],
    "Institut Agro Rennes-Angers": [48.1140652783794, -1.7062956999598533],
  };
  const positions = Object.values(geoPos);
  
  const hashCode = (s: string): number =>
    s ? s.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0) : 0;
  
  const lora = (nb: number) => `8cf9574000002d${nb + 1}d`.toUpperCase();
  
  const featureofinterest = (nb: number) =>
    `WITH featureofinterest AS (
          INSERT INTO "featureofinterest" 
                       ("description", "encodingType", "feature", "name") 
                       values (
                          'This is the weather station Number ${numberStr[nb]}',
                          'application/vnd.geo+json', 
                          '{"type":"Point","coordinates":["${
                            positions[nb][0]
                          }","${positions[nb][1]}"]}',
                           'Weather Station ${nb + 1}'
                      ) RETURNING *) SELECT * FROM featureofinterest;`;
  
  const sensor = (nb: number) =>
    `WITH sensor AS (INSERT INTO "sensor" ("description", "encodingType", "metadata", "name") values ('PM sensor Number ${
      numberStr[nb]
    }', 'application/pdf', 'http://particle-sensor.com/', 'PM ${
      nb + 1
    } sensor') RETURNING *)SELECT * FROM sensor;`;
  
  const thing = (nb: number) =>
    nb < 5
      ? `WITH thing AS (
              INSERT INTO "thing" 
              ("description", "name", "properties") 
              values (
                  'A SensorThingWeb thing Number ${numberStr[nb]}', 
                  'SensorWebThing ${nb + 1}', 
                  '{"owner":"Mozilla version ${
                    numberStr[nb]
                  }","organization":"Mozilla"}'
             ) RETURNING *)SELECT * FROM thing;`
      : `WITH thing AS (
              INSERT INTO "thing" 
              ("description", "name", "properties") 
              values (
                  'A SensorWeb thing Number ${numberStr[nb]}', 
                  'SensorWebThing ${nb + 1}', 
                  '{"owner":"Mozilla version ${
                    numberStr[nb]
                  }","organization":"Mozilla"}'
              ) RETURNING *), 
              location1 AS (
                  INSERT INTO "location" 
                  ("description", "encodingType", "location", "name") 
                  values (
                      '${Object.keys(geoPos)[nb]}', 
                      'application/vnd.geo+json', 
                      '{"type":"Point","coordinates":["${positions[nb][0]}","${
          positions[nb][1]
        }"]}', 
                      'UofC Number ${numberStr[nb]}'
              ) RETURNING id), 
              thing_location AS (
                  INSERT INTO "thing_location" 
                  ("location_id", "thing_id")
                  values (
                      (SELECT location1.id from location1), 
                      (SELECT thing.id from thing)
              ) RETURNING thing_id)SELECT * FROM thing;`;
  
  const thingMulti = (nb: number) =>
    `WITH thing AS (
          INSERT INTO "thing" 
          ("description", "name", "properties") 
          values ( 
              'A SensorWeb lora MultiDatastreams Number ${numberStr[nb]}', 
              'MultiDatastreams SensorWebThing ${nb + 1}', 
              '{"essai":"${lora(nb)}","sensor_id":"zzz${lora(nb)}"}'
      ) RETURNING *), 
      location1 AS (
          INSERT INTO "location" 
          ("description", "encodingType", "location", "name") 
          values (
              '${Object.keys(geoPos)[nb]}', 
              'application/vnd.geo+json', 
              '{"type":"Point","coordinates":["${positions[nb][0]}","${
      positions[nb][1]
    }"]}', 
              'UofC (Created new location) for MultiDatastream Number ${
                numberStr[nb]
              }'
      )RETURNING id), 
      thing_location AS (
          INSERT INTO "thing_location" 
          ("location_id", "thing_id") 
          values (
              (SELECT location1.id from location1),
               (SELECT thing.id from thing)
      )RETURNING thing_id)SELECT * FROM thing;`;
  const observedproperty = (nb: number) =>
    `WITH observedproperty AS (
          INSERT INTO "observedproperty" 
          ("definition", "description", "name") 
          values (
              'https://airnow.gov/index.cfm?action=aqibasics.particle', 
              'PM something Number ${numberStr[nb]}', 
              'PM ${nb + 1} observedProperties'
          ) RETURNING *) 
      SELECT * FROM observedproperty;`;
  const datastream = (nb: number) =>
    `WITH datastream AS (
          INSERT INTO "datastream" 
          ("description", "_default_foi","name", "observedproperty_id", "sensor_id", "thing_id", "unitOfMeasurement") 
          values (
              'Air quality Number ${numberStr[nb]}',
              1, 
              'air_quality_readings${nb + 1}', 
              ${
                [
                  "3, 1, 4",
                  "2, 1, 5",
                  "2, 3, 5",
                  "4, 3, 1",
                  "3, 2, 2",
                  "1, 3, 4",
                  "1, 3, 1",
                  "8, 5, 6",
                  "8, 5, 6",
                  "8, 5, 6",
                ][nb]
              }, 
              '{"symbol":"μg/m³","name":"PM 2.${nb + 1} Particulates (ug/m3)","definition":"http://unitsofmeasure.org/ucum.html"}'
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
              'Air quality Number ${numberStr[nb]}', 
              ${
                [
                  "3, 12",
                  "1, 12",
                  "3, 10",
                  "3, 14",
                  "3, 13",
                  "4, 13",
                  "1, 10",
                  "5, 15",
                  "5, 15",
                  "5, 15",
                ][nb]
              }, 
              '{"Measurement", "Measurement", "Measurement"}', 
              '[{"name":"soil moisture","symbol":"%","definition":"http://unitsofmeasure.org/humidity.html"},{"name":"soil temperature","symbol":"°","definition":"http://unitsofmeasure.org/temperature.html"},{"name":"battery voltage","symbol":"%","definition":"http://unitsofmeasure.org/percentage.html"}]'
      ) RETURNING *), 
      observedproperty3 AS (
          INSERT INTO "observedproperty" 
          ("name", "definition") 
          values (
              'battery voltage ${numberStr[nb]}',
              'battery voltage'
      )RETURNING id), 
      observedproperty2 AS (
          INSERT INTO "observedproperty" 
          ("name", "definition") 
          values (
              'soil temperature ${numberStr[nb]}', 
              'soil temperature'
      )RETURNING id), 
      observedproperty1 AS (
          INSERT INTO "observedproperty" 
          ("name", "definition") 
          values (
              'soil moisture ${numberStr[nb]}', 
              'soil moisture'
      )RETURNING id), 
      multi_datastream_observedproperty AS (
          INSERT INTO "multi_datastream_observedproperty" 
          ("multidatastream_id", "observedproperty_id") 
          values (
              (SELECT multidatastream.id from multidatastream), 
              (SELECT observedproperty1.id from observedproperty1)
      )RETURNING multidatastream_id), 
      multi_datastream_observedproperty1 AS (
          INSERT INTO "multi_datastream_observedproperty" 
          ("multidatastream_id", "observedproperty_id") 
          values (
              (SELECT multidatastream.id from multidatastream), 
              (SELECT observedproperty3.id from observedproperty3)
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
              'Lora Number ${numberStr[nb]}', 
              'Lora Number ${nb + 1}', 
              ${[3, 1, 4, 5][nb]},
              '${lora(nb)}',
              ${[2, 1, 3, 1][nb]}
      )RETURNING *) 
      SELECT * FROM lora;`;
  
  // const creatResult = (nb: number) => `'${nb}'`;
  const creatResult = (nb: number) => `'{ "value": ${nb}}'`;
  const creatResultWulti = (nb: number[]) =>
    `'{"value": [${nb}],"valueskeys": {"soil moisture": ${nb[0]},"soil temperature": ${nb[1]},"battery voltage": ${nb[2]}}}'`;
  
  const datas = [
    `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "result") values (1, 2, '2016-11-08T06:15:15.790Z','2016-11-08T06:15:15.790Z', '2016-11-18T18:30:30.790Z', ${creatResult(
      17.5
    )}) RETURNING *)SELECT * FROM observation;`,
    `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "result") values (2, 1, '2016-11-09T03:15:15.790Z','2016-11-09T03:15:15.790Z', '2016-11-18T15:30:30.790Z', ${creatResult(
      11.666666666666666
    )}) RETURNING *)SELECT * FROM observation;`,
    `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "result") values (3, 3, '2016-11-10T01:15:15.790Z','2016-11-10T01:15:15.790Z', '2016-11-18T11:30:30.790Z', ${creatResult(
      8.75
    )}) RETURNING *)SELECT * FROM observation;`,
    `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "result") values (4, 1, '2016-11-11T08:15:15.790Z','2016-11-11T08:15:15.790Z', '2016-11-18T15:30:30.790Z', ${creatResult(
      17.5
    )}) RETURNING *)SELECT * FROM observation;`,
    `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "result") values (1, 4, '2016-11-12T02:15:15.790Z','2016-11-12T02:15:15.790Z', '2016-11-18T15:30:30.790Z', ${creatResult(
      11.666666666666666
    )}) RETURNING *)SELECT * FROM observation;`,
    `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "result") values (3, 4, '2016-11-13T05:15:15.790Z','2016-11-13T05:15:15.790Z', '2016-11-18T16:30:30.790Z', ${creatResult(
      8.75
    )}) RETURNING *)SELECT * FROM observation;`,
    `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "result") values (2, 2, '2016-11-14T02:15:15.790Z','2016-11-14T02:15:15.790Z', '2016-11-18T18:30:30.790Z', ${creatResult(
      17.5
    )}) RETURNING *)SELECT * FROM observation;`,
    `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "result") values (10, 4, '2016-11-15T02:15:15.790Z', '2016-11-15T02:15:15.790Z', '2016-11-18T17:30:30.790Z', ${creatResult(
      45
    )}) RETURNING *)SELECT * FROM observation;`,
    `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "result") values (10, 1, '2016-11-16T07:15:15.790Z', '2016-11-16T07:15:15.790Z', '2016-11-18T18:30:30.790Z', ${creatResult(
      45
    )}) RETURNING *)SELECT * FROM observation;`,
    `WITH observation AS (INSERT INTO "observation" ("datastream_id", "featureofinterest_id", "phenomenonTime", "resultTime", "validTime", "result") values (10, 2, '2016-11-17T02:15:15.790Z', '2016-11-17T02:15:15.790Z', '2016-11-18T18:30:30.790Z', ${creatResult(
      45
    )}) RETURNING *)SELECT * FROM observation;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 2), 2) AS id), multidatastream1 AS (SELECT coalesce((SELECT "id" from "multidatastream" WHERE "id" = 2), 2) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "result") values ((SELECT featureofinterest1.id from featureofinterest1), (SELECT multidatastream1.id from multidatastream1), '2016-11-08T01:15:15.790Z', '2016-11-09T12:30:30.790Z', ${creatResultWulti(
      [35, 35, 35]
    )})RETURNING *)SELECT * FROM observation;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 2), 2) AS id), multidatastream1 AS (SELECT coalesce((SELECT "id" from "multidatastream" WHERE "id" = 2), 2) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "result") values ((SELECT featureofinterest1.id from featureofinterest1), (SELECT multidatastream1.id from multidatastream1), '2016-11-09T04:15:15.790Z', '2016-11-10T14:30:30.790Z', ${creatResultWulti(
      [17.5, 35, 17.5]
    )})RETURNING *)SELECT * FROM observation;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 4), 4) AS id), multidatastream1 AS (SELECT coalesce((SELECT "id" from "multidatastream" WHERE "id" = 1), 1) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "result") values ((SELECT featureofinterest1.id from featureofinterest1), (SELECT multidatastream1.id from multidatastream1), '2016-11-10T03:15:15.790Z', '2016-11-11T15:30:30.790Z', ${creatResultWulti(
      [8.75, 17.5, 8.75]
    )})RETURNING *)SELECT * FROM observation;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 3), 3) AS id), multidatastream1 AS (SELECT coalesce((SELECT "id" from "multidatastream" WHERE "id" = 4), 4) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "result") values ((SELECT featureofinterest1.id from featureofinterest1), (SELECT multidatastream1.id from multidatastream1), '2016-11-11T06:15:15.790Z', '2016-11-12T11:30:30.790Z', ${creatResultWulti(
      [8.75, 11.666666666666666, 17.5]
    )})RETURNING *)SELECT * FROM observation;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 1), 1) AS id), multidatastream1 AS (SELECT coalesce((SELECT "id" from "multidatastream" WHERE "id" = 1), 1) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "result") values ((SELECT featureofinterest1.id from featureofinterest1), (SELECT multidatastream1.id from multidatastream1), '2016-11-12T06:15:15.790Z', '2016-11-13T12:30:30.790Z', ${creatResultWulti(
      [17.5, 17.5, 35]
    )})RETURNING *)SELECT * FROM observation;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 3), 3) AS id), multidatastream1 AS (SELECT coalesce((SELECT "id" from "multidatastream" WHERE "id" = 1), 1) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "result") values ((SELECT featureofinterest1.id from featureofinterest1), (SELECT multidatastream1.id from multidatastream1), '2016-11-13T08:15:15.790Z', '2016-11-14T14:30:30.790Z', ${creatResultWulti(
      [35, 17.5, 11.666666666666666]
    )})RETURNING *)SELECT * FROM observation;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 2), 2) AS id), multidatastream1 AS (SELECT coalesce((SELECT "id" from "multidatastream" WHERE "id" = 4), 4) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "result") values ((SELECT featureofinterest1.id from featureofinterest1), (SELECT multidatastream1.id from multidatastream1), '2016-11-14T03:15:15.790Z', '2016-11-15T12:30:30.790Z', ${creatResultWulti(
      [11.666666666666666, 17.5, 11.666666666666666]
    )})RETURNING *)SELECT * FROM observation;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 3), 3) AS id), multidatastream1 AS (SELECT coalesce((SELECT "id" from "multidatastream" WHERE "id" = 10), 10) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "result") values ((SELECT featureofinterest1.id from featureofinterest1), (SELECT multidatastream1.id from multidatastream1), '2016-11-15T05:15:15.790Z', '2016-11-16T13:30:30.790Z', ${creatResultWulti(
      [45, 50, 55]
    )})RETURNING *)SELECT * FROM observation;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 4), 4) AS id), multidatastream1 AS (SELECT coalesce((SELECT "id" from "multidatastream" WHERE "id" = 10), 10) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "result") values ((SELECT featureofinterest1.id from featureofinterest1), (SELECT multidatastream1.id from multidatastream1), '2016-11-16T02:15:15.790Z', '2016-11-17T15:30:30.790Z', ${creatResultWulti(
      [45, 50, 55]
    )})RETURNING *)SELECT * FROM observation;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 1), 1) AS id), multidatastream1 AS (SELECT coalesce((SELECT "id" from "multidatastream" WHERE "id" = 10), 10) AS id), observation AS (INSERT INTO "observation" ("featureofinterest_id", "multidatastream_id", "phenomenonTime", "resultTime", "result") values ((SELECT featureofinterest1.id from featureofinterest1), (SELECT multidatastream1.id from multidatastream1), '2016-11-17T07:15:15.790Z', '2016-11-18T17:30:30.790Z', ${creatResultWulti(
      [45, 50, 55]
    )})RETURNING *)SELECT * FROM observation;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), thing1 AS (SELECT coalesce((SELECT "id" from "thing" WHERE "id" = 5), 5) AS id), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 4), 4) AS id), location AS (INSERT INTO "location" ("description", "encodingType", "location", "name") values ('${
      Object.keys(geoPos)[6]
    }', 'application/vnd.geo+json', '{"type":"Point","coordinates":["${
      positions[6][0]
    }","${
      positions[6][1]
    }"]}', 'My Location 6')RETURNING *), thing_location AS (INSERT INTO "thing_location" ("location_id", "thing_id") values ((SELECT location.id from location), (SELECT thing1.id from thing1))RETURNING thing_id)SELECT * FROM location;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), thing1 AS (SELECT coalesce((SELECT "id" from "thing" WHERE "id" = 5), 5) AS id), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 1), 1) AS id), location AS (INSERT INTO "location" ("description", "encodingType", "location", "name") values ('${
      Object.keys(geoPos)[7]
    }', 'application/vnd.geo+json', '{"type":"Point","coordinates":["${
      positions[7][0]
    }","${
      positions[7][1]
    }"]}', 'My Location 7')RETURNING *), thing_location AS (INSERT INTO "thing_location" ("location_id", "thing_id") values ((SELECT location.id from location), (SELECT thing1.id from thing1))RETURNING thing_id)SELECT * FROM location;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), thing1 AS (SELECT coalesce((SELECT "id" from "thing" WHERE "id" = 5), 5) AS id), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 3), 3) AS id), location AS (INSERT INTO "location" ("description", "encodingType", "location", "name") values ('${
      Object.keys(geoPos)[8]
    }', 'application/vnd.geo+json', '{"type":"Point","coordinates":["${
      positions[8][0]
    }","${
      positions[8][1]
    }"]}', 'My Location 8')RETURNING *), thing_location AS (INSERT INTO "thing_location" ("location_id", "thing_id") values ((SELECT location.id from location), (SELECT thing1.id from thing1))RETURNING thing_id)SELECT * FROM location;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), thing1 AS (SELECT coalesce((SELECT "id" from "thing" WHERE "id" = 5), 5) AS id), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 4), 4) AS id), location AS (INSERT INTO "location" ("description", "encodingType", "location", "name") values ('${
      Object.keys(geoPos)[9]
    }', 'application/vnd.geo+json', '{"type":"Point","coordinates":["${
      positions[9][0]
    }","${
      positions[9][1]
    }"]}', 'My Location 9')RETURNING *), thing_location AS (INSERT INTO "thing_location" ("location_id", "thing_id") values ((SELECT location.id from location), (SELECT thing1.id from thing1))RETURNING thing_id)SELECT * FROM location;`,
    `WITH "log_request" as (SELECT srid FROM "spatial_ref_sys" LIMIT 1), thing1 AS (SELECT coalesce((SELECT "id" from "thing" WHERE "id" = 5), 5) AS id), featureofinterest1 AS (SELECT coalesce((SELECT "id" from "featureofinterest" WHERE "id" = 1), 1) AS id), location AS (INSERT INTO "location" ("description", "encodingType", "location", "name") values ('${
      Object.keys(geoPos)[10]
    }', 'application/vnd.geo+json', '{"type":"Point","coordinates":["${
      positions[10][0]
    }","${
      positions[10][1]
    }"]}', 'My Location 10')RETURNING *), thing_location AS (INSERT INTO "thing_location" ("location_id", "thing_id") values ((SELECT location.id from location), (SELECT thing1.id from thing1))RETURNING thing_id)SELECT * FROM location;`,
    `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (2, '2014-12-11T14:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
    `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (2, '2014-12-21T12:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
    `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (7, '2014-12-21T16:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
    `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (2, '2014-12-11T17:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
    `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (7, '2014-12-11T17:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
    `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (5, '2014-12-11T16:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
    `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (1, '2014-12-21T15:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
    `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (4, '2014-12-11T15:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
    `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (6, '2014-12-21T15:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
    `WITH historical_location AS (INSERT INTO "historical_location" ("thing_id", "time") values (7, '2014-12-11T13:59:59.00+08:00') RETURNING *)SELECT * FROM historical_location;`,
  ];
  
  export const testsDatas = (): string[] => {
    const result: string[] = [
      `WITH decoder AS (INSERT INTO "decoder" (
          "name", 
          "hash", 
          "code",
           "nomenclature") VALUES (
              'RHF1S001', 
              '${hashCode(decoders.rhf1s001)}', 
              '${decoders.rhf1s001}', 
              '{ "voltage": "battery voltage", "period": "periods", "0110": "air temperature", "0210": "air humidity", "0310": "light intensity", "0410": "humidity", "0510": "barometric pressure", "0610": "soil temperature", "0700": "battery", "0710": "soil moisture" }'
          ) RETURNING *)SELECT * FROM decoder;`,
      `WITH decoder AS (INSERT INTO "decoder" (
          "name", 
          "hash", 
          "code", 
          "nomenclature", 
          "synonym") VALUES  (
              'Sensecap', 
              '${hashCode(decoders.senscap)}',     
              '${decoders.senscap}',
              '{"4097": "Air Temperature", "4098": "Air Humidity", "4099": "Light Intensity", "4100": "CO2", "4101": "Barometric Pressure", "4102": "Soil Temperature", "4103": "Soil Moisture", "4104": "Wind Direction", "4105": "Wind Speed", "4106": "pH", "4107": "Light Quantum", "4108": "Electrical Conductivity", "4109": "Dissolved Oxygen", "4110": "Soil Volumetric Water Content", "4113": "Rainfall Hourly", "4115": "Distance", "4116": "Water Leak", "4117": "Liguid Level", "4118": "NH3", "4119": "H2S", "4120": "Flow Rate", "4121": "Total Flow", "4122": "Oxygen Concentration", "4123": "Water Eletrical Conductivity", "4124": "Water Temperature", "4125": "Soil Heat Flux", "4126": "Sunshine Duration", "4127": "Total Solar Radiation", "4128": "Water Surface Evaporation", "4129": "Photosynthetically Active Radiation(PAR)", "4130": "Accelerometer", "4131": "Sound Intensity", "4133": "Soil Tension", "4134": "Salinity", "4135": "TDS", "4136": "Leaf Temperature", "4137": "Leaf Wetness", "4138": "Soil Moisture-10cm", "4139": "Soil Moisture-20cm", "4140": "Soil Moisture-30cm", "4141": "Soil Moisture-40cm", "4142": "Soil Temperature-10cm", "4143": "Soil Temperature-20cm", "4144": "Soil Temperature-30cm", "4145": "Soil Temperature-40cm", "4146": "PM2.5", "4147": "PM10", "4148": "Noise", "4150": "AccelerometerX", "4151": "AccelerometerY", "4152": "AccelerometerZ", "4157": "Ammonia ion", "4165": "Measurement1", "4166": "Measurement2", "4167": "Measurement3", "4168": "Measurement4", "4169": "Measurement5", "4170": "Measurement6", "4171": "Measurement7", "4172": "Measurement8", "4173": "Measurement9", "4174": "Measurement10", "4175": "AI Detection No.01", "4176": "AI Detection No.02", "4177": "AI Detection No.03", "4178": "AI Detection No.04", "4179": "AI Detection No.05", "4180": "AI Detection No.06", "4181": "AI Detection No.07", "4182": "AI Detection No.08", "4183": "AI Detection No.09", "4184": "AI Detection No.10", "4190": "UV Index", "4191": "Peak Wind Gust", "4192": "Sound Intensity", "4193": "Light Intensity", "4195": "TVOC", "4196": "Soil moisture intensity", "5100": "Switch"}',
              '{"Soil Moisture": ["humide", "humidity"], "soil temperature": ["temperature"]}') RETURNING *)SELECT * FROM decoder;`,
      `WITH decoder AS (INSERT INTO "decoder" (
          "name", 
          "hash", 
          "code") VALUES  (
              'Watteco', 
              '${hashCode(decoders.wattEco)}',  
              '${decoders.wattEco}') RETURNING *)SELECT * FROM decoder;`,
    ];
    try {
      for (let i = 0; i < 5; i++) {
        result.push(featureofinterest(i));
      }
      
  
      for (let i = 0; i < 7; i++) {
        result.push(sensor(i));
      }
      
  
      for (let i = 0; i < 10; i++) {
        result.push(thing(i));
      }
      
  
      for (let i = 0; i < 10; i++) {
        result.push(thingMulti(i));
      }
      
      for (let i = 0; i < 10; i++) {
        result.push(observedproperty(i));
      }
      
  
      for (let i = 0; i < 10; i++) {
        result.push(datastream(i));
      }
      
  
      for (let i = 0; i < 10; i++) {
        result.push(multiDatastream(i));
      }
      
  
      for (let i = 0; i < 4; i++) {
        result.push(loras(i));
      }
      
  
      datas.forEach((elem: string) => result.push(elem));
      
    } catch (error) {
      log.errorMsg(error);
    } finally {
      return result;
    }
  };
  