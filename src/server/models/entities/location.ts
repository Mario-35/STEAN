/**
 * entity Location.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createEntity } from ".";
import { EnumRelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";

export const Location:Ientity  = createEntity("Locations", {
    createOrder: 2,
    order: 6,
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
        type: EnumRelations.belongsToMany,
        expand: `"thing"."id" in (SELECT "thinglocation"."thing_id" from "thinglocation" WHERE "thinglocation"."location_id" = "location"."id")`,
        link: `"thing"."id" in (SELECT "thinglocation"."thing_id" from "thinglocation" WHERE "thinglocation"."location_id" = $ID)`,
        entityName: "Things",
        tableName: "thinglocation",
        relationKey: "location_id",
        entityColumn: "thing_id",
        tableKey: "thing_id",
      },
      HistoricalLocations: {
        type: EnumRelations.belongsToMany,
        expand: `"historicallocation"."id" in (SELECT "historicallocation"."id" from "historicallocation" WHERE "historicallocation"."thing_id" in (SELECT "thinglocation"."thing_id" from "thinglocation" WHERE "thinglocation"."location_id" = "location"."id"))`,
        link: `"historicallocation"."id" in (SELECT "historicallocation"."id" from "historicallocation" WHERE "historicallocation"."thing_id" in (SELECT "thinglocation"."thing_id" from "thinglocation" WHERE "thinglocation"."location_id" = $ID))`,
        entityName: "HistoricalLocations",
        tableName: "locationhistoricallocation",
        relationKey: "location_id",
        entityColumn: "id",
        tableKey: "id",
      },
    },
  });