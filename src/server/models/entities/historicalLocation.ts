/**
 * entity HistoricalLocation.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType, Erelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";

export const HistoricalLocation:Ientity = {
    name: "HistoricalLocations",
    singular: "HistoricalLocation",
    table: "historical_location",
    createOrder: -1,
    order: 5,
    extensions: [EextensionsType.base],
    orderBy: `"id"`,
    count: `SELECT count(DISTINCT id) from "historical_location" AS count` ,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias(config: IconfigFile, test: IKeyBoolean) {
           return `"id"${test["alias"] && test["alias"] === true  === true ? ` AS "@iot.id"`: ''}` ;
        },
        type: "bigint"
      },
      time: {
        create: "timestamptz NULL",
        columnAlias() {
          return undefined;
        },
        type: "date"
      },
      thing_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "bigint"
      },
    },
    constraints: {
      historical_location_pkey: 'PRIMARY KEY ("id")',
      historical_location_thing_id_fkey:
        'FOREIGN KEY ("thing_id") REFERENCES "thing"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      historical_location_thing_id:
        'ON public."historical_location" USING btree ("thing_id")',
    },
    relations: {
      Things: {
        type: Erelations.belongsTo,
        expand: `"thing"."id" = "historical_location"."thing_id"`,
        link: `"thing"."id" = (SELECT "historical_location"."thing_id" from "historical_location" WHERE "historical_location"."id" = $ID)`,
        entityName: "Things",
        tableName: "thing",
        relationKey: "thing_id",
        entityColumn: "id",
        tableKey: "id",
      },
      Locations: {
        type: Erelations.belongsToMany,
        expand: `"location"."id" in (SELECT "location"."id" from "location" WHERE "location"."id" in (SELECT "thing_location"."location_id" from "thing_location" WHERE "thing_location"."thing_id" = "historical_location"."thing_id"))`,
        link: `"location"."id" in (SELECT "location"."id" from "location" WHERE "location"."id" in (SELECT "thing_location"."location_id" from "thing_location" WHERE "thing_location"."thing_id" in (SELECT "historical_location"."thing_id" from "historical_location" WHERE "historical_location"."id" = $ID)))`,
        entityName: "locationsHistoricalLocations",
        tableName: "location_historical_location",
        relationKey: "historical_location_id",
        entityColumn: "location_id",
        tableKey: "location_id",
      },
    },
  };