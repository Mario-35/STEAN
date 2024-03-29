/**
 * entity Observation.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType, Erelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";

  export const Observation:Ientity = {
    name: "Observations",
    singular: "Observation",
    table: "observation",
    createOrder: 12,
    order: 7,
    extensions: [EextensionsType.base],
    orderBy: `"phenomenonTime"`,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias(config: IconfigFile, test: IKeyBoolean) {
           return `"id"${test["alias"] && test["alias"] === true  === true ? ` AS "@iot.id"`: ''}` ;
        },
        type: "number",
      },
      phenomenonTime: {
        create: "timestamptz NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "date",
      },
      result: {
        create: "jsonb NULL",
        columnAlias(config: IconfigFile, test: IKeyBoolean | undefined) {
          if (!test) return "result";  
          if (test["valueskeys"] && test["valueskeys"] === true) 
            return `COALESCE("result"-> 'valueskeys', "result"-> 'value')${test && test["as"] === true ? ` AS "result"`: ''}`;
          if (test["numeric"] && test["numeric"] === true)
            return`CASE 
            WHEN jsonb_typeof("result"-> 'value') = 'number' THEN ("result"->>'value')::numeric 
            WHEN jsonb_typeof("result"-> 'value') = 'array' THEN ("result"->>'value')[0]::numeric 
            END${test && test["as"] === true ? ` AS "result"`: ''}`;
          return `"result"->'value'${test && test["as"] === true ? ` AS "result"`: ''}`;
        },
        type: "result",
      },
      resultTime: {
        create: "timestamptz NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "date",
      },
      resultQuality: {
        create: "jsonb NULL",
        columnAlias() {
          return undefined;
        },
        type: "json",
      },
      validTime: {
        create: "timestamptz DEFAULT CURRENT_TIMESTAMP",
        columnAlias() {
          return undefined;
        },
        type: "date",
      },
      parameters: {
        create: "jsonb NULL",
        columnAlias() {
          return undefined;
        },
        type: "json",
      },
      datastream_id: {
        create: "BIGINT NULL",
        columnAlias() {
          return undefined;
        },
        type: "relation:Datastreams",
      },
      multidatastream_id: {
        create: "BIGINT NULL",
        columnAlias() {
          return undefined;
        },
        type: "relation:MultiDatastreams",
      },
      featureofinterest_id: {
        create: "BIGINT NOT NULL DEFAULT 1",
        columnAlias() {
          return undefined;
        },
        type: "relation:FeaturesOfInterest",
      },
    },
    constraints: {
      observation_pkey: 'PRIMARY KEY ("id")',
      observation_unik_datastream_result:
        'UNIQUE ("phenomenonTime", "resultTime", "datastream_id", "featureofinterest_id", "result")',
      observation_unik_multidatastream_result:
        'UNIQUE ("phenomenonTime", "resultTime", "multidatastream_id", "featureofinterest_id", "result")',
      observation_datastream_id_fkey:
        'FOREIGN KEY ("datastream_id") REFERENCES "datastream"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      observation_multidatastream_id_fkey:
        'FOREIGN KEY ("multidatastream_id") REFERENCES "multidatastream"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      observation_featureofinterest_id_fkey:
        'FOREIGN KEY ("featureofinterest_id") REFERENCES "featureofinterest"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      observation_datastream_id:
        'ON public."observation" USING btree ("datastream_id")',
      observation_multidatastream_id:
        'ON public."observation" USING btree ("multidatastream_id")',
      observation_featureofinterest_id:
        'ON public."observation" USING btree ("featureofinterest_id")',
    },
    relations: {
      Datastream: {
        type: Erelations.belongsTo,
        expand: `"datastream"."id" = "observation"."datastream_id"`,
        link: `"datastream"."id" = (SELECT "observation"."datastream_id" FROM "observation" WHERE "observation"."id" = $ID)`,
        entityName: "Datastreams",
        tableName: "observation",
        relationKey: "id",
        entityColumn: "datastream_id",
        tableKey: "id",
      },
      MultiDatastream: {
        type: Erelations.belongsTo,
        expand: `"multidatastream"."id" = "observation"."multidatastream_id"`,
        link: `"multidatastream"."id" = (SELECT "observation"."multidatastream_id" FROM "observation" WHERE "observation"."id" = $ID)`,
        entityName: "MultiDatastreams",
        tableName: "observation",
        relationKey: "id",
        entityColumn: "multidatastream_id",
        tableKey: "id",
      },
      FeatureOfInterest: {
        type: Erelations.belongsTo,
        expand: `"featureofinterest"."id" = "observation"."featureofinterest_id"`,
        // link: "err: 501 : Not Implemented.",
        link: `"featureofinterest"."id" = (SELECT "observation"."featureofinterest_id" FROM "observation" WHERE "observation"."id" = $ID)`,        
        entityName: "FeaturesOfInterest",
        tableName: "featureofinterest",
        relationKey: "id",
        entityColumn: "featureofinterest_id",
        tableKey: "id",
      },
    },
  };