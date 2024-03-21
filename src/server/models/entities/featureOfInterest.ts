/**
 * entity FeatureOfInterest.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType, Erelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";

export const FeatureOfInterest:Ientity = {
            name: "FeaturesOfInterest",
            singular: "FeatureOfInterest",
            table: "featureofinterest",
            createOrder: 4,
            order: 4,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: `SELECT count(DISTINCT id) from "featureofinterest" AS count` ,
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
                create: "text NOT NULL DEFAULT 'description'::text",
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
                type: "text",
              },
              feature: {
                create: "jsonb NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "json",
                test: "encodingType",
              }
            },
            relations: {
              Observations: {
                type: Erelations.hasMany,
                expand: `"observation"."id" in (SELECT "observation"."id" from "observation" WHERE "observation"."featureofinterest_id" = "featureofinterest"."id")`,
                link: `"observation"."id" in (SELECT "observation"."id" from "observation" WHERE "observation"."featureofinterest_id" = $ID)`,
                entityName: "Observations",
                tableName: "observation",
                relationKey: "featureofinterest_id",
                entityColumn: "id",
                tableKey: "id",
              },
              Datastreams: {
                type: Erelations.hasMany,
                expand: `"datastream"."id" in (SELECT "datastream"."id" from "datastream" WHERE "datastream"."_default_foi" = "featureofinterest"."id")`,
                link: `"datastream"."id" in (SELECT "datastream"."id" from "datastream" WHERE "datastream"."_default_foi" = $ID)`,
                entityName: "Datastreams",
                tableName: "datastream",
                relationKey: "_default_foi",
                entityColumn: "id",
                tableKey: "id",
              },
            },
            constraints: {
              featureofinterest_pkey: 'PRIMARY KEY ("id")',
              featureofinterest_unik_name: 'UNIQUE ("name")',
            },
            after:
              "INSERT INTO featureofinterest (name, description, \"encodingType\", feature) VALUES ('Default Feature of Interest', 'Default Feature of Interest', 'application/vnd.geo+json', '{}');",
          };