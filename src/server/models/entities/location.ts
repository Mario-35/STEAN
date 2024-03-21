/**
 * entity Location.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType, Erelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";

export const Location:Ientity = {
    name: "Locations",
    singular: "Location",
    table: "location",
    createOrder: 2,
    order: 6,
    extensions: [EextensionsType.base],
    orderBy: `"id"`,
    count: `SELECT count(DISTINCT id) from "Location" AS count` ,
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
        create: "text NOT NULL",
        columnAlias() {
          return undefined;
        },
        dataList: {
          GeoJSON: "application/vnd.geo+json",
        },
        type: "list",
      },
      location: {
        create: "jsonb NOT NULL",
        columnAlias() {
          return undefined;
        },

        type: "json",
        test: "encodingType",
      }
    },
    constraints: {
      location_pkey: 'PRIMARY KEY ("id")',
      location_unik_name: 'UNIQUE ("name")',
    },
    relations: {
      Things: {
        type: Erelations.belongsToMany,
        expand: `"thing"."id" in (SELECT "thing_location"."thing_id" from "thing_location" WHERE "thing_location"."location_id" = "location"."id")`,
        link: `"thing"."id" in (SELECT "thing_location"."thing_id" from "thing_location" WHERE "thing_location"."location_id" = $ID)`,
        entityName: "Things",
        tableName: "thing_location",
        relationKey: "location_id",
        entityColumn: "thing_id",
        tableKey: "thing_id",
      },
      HistoricalLocations: {
        type: Erelations.belongsToMany,
        expand: `"historical_location"."id" in (SELECT "historical_location"."id" from "historical_location" WHERE "historical_location"."thing_id" in (SELECT "thing_location"."thing_id" from "thing_location" WHERE "thing_location"."location_id" = "location"."id"))`,
        link: `"historical_location"."id" in (SELECT "historical_location"."id" from "historical_location" WHERE "historical_location"."thing_id" in (SELECT "thing_location"."thing_id" from "thing_location" WHERE "thing_location"."location_id" = $ID))`,
        entityName: "HistoricalLocations",
        tableName: "location_historical_location",
        relationKey: "location_id",
        entityColumn: "id",
        tableKey: "id",
      },
    },
  }