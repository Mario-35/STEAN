/**
 * entity Sensor.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType, Erelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";



  export const Sensor:Ientity = {
    name: "Sensors",
    singular: "Sensor",
    table: "sensor",
    createOrder: 6,
    order: 9,
    extensions: [EextensionsType.base],
    orderBy: `"id"`,
    count: `SELECT count(DISTINCT id) from "sensor" AS count` ,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias(config: IconfigFile, test: IKeyBoolean) {
           return `"id"${test["alias"] && test["alias"] === true  === true ? ` AS "@iot.id"`: ''}` ;
        },
        type: "number",
      },
      name: {
        create: "text NOT NULL DEFAULT 'no name'::text",
        columnAlias() {
          return undefined;
        },
        type: "text",
      },
      description: {
        create: "text NOT NULL DEFAULT 'no description'::text",
        columnAlias() {
          return undefined;
        },
        type: "text",
      },
      encodingType: {
        create: "text NOT NULL DEFAULT 'application/pdf'::text",
        columnAlias() {
          return undefined;
        },
        dataList: {
          PDF: "application/pdf",
          SensorML: "http://www.opengis.net/doc/IS/SensorML/2.0",
        },
        type: "list",
      },
      metadata: {
        create: "text NOT NULL DEFAULT 'none.pdf'::text",
        columnAlias() {
          return undefined;
        },
        type: "text",
      },
    },
    constraints: {
      sensor_pkey: 'PRIMARY KEY ("id")',
      sensor_unik_name: 'UNIQUE ("name")',
    },
    relations: {
      Datastreams: {
        type: Erelations.hasMany,
        expand: `"datastream"."id" in (SELECT "datastream"."id" from "datastream" WHERE "datastream"."sensor_id" = "sensor"."id")`,
        link: `"datastream"."id" in (SELECT "datastream"."id" from "datastream" WHERE "datastream"."sensor_id" = $ID)`,
        entityName: "Datastreams",
        tableName: "datastream",
        relationKey: "sensor_id",
        entityColumn: "id",
        tableKey: "id",
      },
      MultiDatastreams: {
        type: Erelations.hasMany,
        expand: `"multidatastream"."id" in (SELECT "multidatastream"."id" from "multidatastream" WHERE "multidatastream"."sensor_id" = "sensor"."id")`,
        link: `"multidatastream"."id" in (SELECT "multidatastream"."id" from "multidatastream" WHERE "multidatastream"."sensor_id" = $ID)`,
        entityName: "MultiDatastreams",
        tableName: "multidatastream",
        relationKey: "sensor_id",
        entityColumn: "id",
        tableKey: "id",
      }
    },
  };