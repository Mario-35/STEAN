/**
 * entity Thing.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType, Erelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";

export const Thing:Ientity = {
    name: "Things",
    singular: "Thing",
    table: "thing",
    createOrder: 1,
    order: 10,
    extensions: [EextensionsType.base],
    orderBy: `"id"`,
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
      }
    },
    constraints: {
      thing_pkey: 'PRIMARY KEY ("id")',
      thing_unik_name: 'UNIQUE ("name")',
    },
    relations: {
      Locations: {
        type: Erelations.belongsToMany,
        expand: `"location"."id" in (SELECT "thing_location"."location_id" from "thing_location" WHERE "thing_location"."thing_id" = "thing"."id")`,
        link: `"location"."id" in (SELECT "thing_location"."location_id" from "thing_location" WHERE "thing_location"."thing_id" = $ID)`,
        entityName: "Locations",
        tableName: "thing_location",
        relationKey: "location_id",
        entityColumn: "thing_id",
        tableKey: "thing_id",
      },
      HistoricalLocations: {
        type: Erelations.hasMany,
        expand: `"historical_location"."id" in (SELECT "historical_location"."id" from "historical_location" WHERE "historical_location"."thing_id" = "thing"."id")`,
        link: `"historical_location"."id" in (SELECT "historical_location"."id" from "historical_location" WHERE "historical_location"."thing_id" = $ID)`,
        entityName: "HistoricalLocations",
        tableName: "historicalLocation",
        relationKey: "thing_id",
        entityColumn: "id",
        tableKey: "id",
      },
      Datastreams: {
        type: Erelations.hasMany,
        expand: `"datastream"."id" in (SELECT "datastream"."id" from "datastream" WHERE "datastream"."thing_id" = "thing"."id")`,
        link: `"datastream"."id" in (SELECT "datastream"."id" from "datastream" WHERE "datastream"."thing_id" = $ID)`,
        entityName: "Datastreams",
        tableName: "datastream",
        relationKey: "thing_id",
        entityColumn: "id",
        tableKey: "id",
      },
      MultiDatastreams: {
        type: Erelations.hasMany,
        expand: `"multidatastream"."id" in (SELECT "multidatastream"."id" from "multidatastream" WHERE "multidatastream"."thing_id" = "thing"."id")`,
        link: `"multidatastream"."id" in (SELECT "multidatastream"."id" from "multidatastream" WHERE "multidatastream"."thing_id" = $ID)`,
        entityName: "MultiDatastreams",
        tableName: "multidatastream",
        relationKey: "thing_id",
        entityColumn: "id",
        tableKey: "id",
      },
    },
  };