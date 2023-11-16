/**
 * Constants for DataBase.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { EextensionsType, EdatesType, Eentities, EobservationType, Erelations, } from "../enums";
import { Ientity } from "../types";
import { getEntitesListFromContext } from "./helpers";

const makeIDAlias = (table: string) => `"${table}"."id" AS "@iot.id"`;
const makeCount = (table: string) => `SELECT count(DISTINCT id) from "${table}" AS count`;
export const _RIGHTS = "SUPERUSER CREATEDB NOCREATEROLE INHERIT LOGIN NOREPLICATION NOBYPASSRLS CONNECTION LIMIT -1";
export type _STREAM = "Datastream" | "MultiDatastream" | undefined;
export const convertResult = (numeric: boolean) =>
  numeric
    ? `result::numeric`
    : `CASE 
    WHEN jsonb_typeof("result"-> 'value') = 'number' then "result"->'value' 
    END::numeric
  `;

const dbDatas: { [key in Eentities]: Ientity } = {
  Things: {
    name: "Things",
    singular: "Thing",
    table: "thing",
    order: 10,
    extensions: [EextensionsType.base],
    orderBy: `"id"`,
    count: makeCount("thing"),
    visible: true,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return makeIDAlias("thing");
        },
        type: "number",
      },
      name: {
        create: "text NOT NULL DEFAULT 'no name'::text",
        columnAlias() {
          return `"name"`;
        },
        type: "text",
      },
      description: {
        create: "text NOT NULL",
        columnAlias() {
          return `"description"`;
        },
        type: "text",
      },
      properties: {
        create: "jsonb NULL",
        columnAlias() {
          return `"properties"`;
        },
        type: "json",
      },
    },
    constraints: {
      thing_pkey: 'PRIMARY KEY ("id")',
      thing_unik_name: 'UNIQUE ("name")',
    },
    canPost: false,
    relations: {
      Locations: {
        type: Erelations.belongsToMany,
        expand: `"location"."id" in (select "thing_location"."location_id" from "thing_location" where "thing_location"."thing_id" = "thing"."id")`,
        link: `"location"."id" in (select "thing_location"."location_id" from "thing_location" where "thing_location"."thing_id" = $ID)`,
        entityName: "Locations",
        tableName: "thing_location",
        relationKey: "location_id",
        entityColumn: "thing_id",
        tableKey: "thing_id",
      },
      HistoricalLocations: {
        type: Erelations.hasMany,
        expand: `"historical_location"."id" in (select "historical_location"."id" from "historical_location" where "historical_location"."thing_id" = "thing"."id")`,
        link: `"historical_location"."id" in (select "historical_location"."id" from "historical_location" where "historical_location"."thing_id" = $ID)`,
        entityName: "HistoricalLocations",
        tableName: "historicalLocation",
        relationKey: "thing_id",
        entityColumn: "id",
        tableKey: "id",
      },
      Datastreams: {
        type: Erelations.hasMany,
        expand: `"datastream"."id" in (select "datastream"."id" from "datastream" where "datastream"."thing_id" = "thing"."id")`,
        link: `"datastream"."id" in (select "datastream"."id" from "datastream" where "datastream"."thing_id" = $ID)`,
        entityName: "Datastreams",
        tableName: "datastream",
        relationKey: "thing_id",
        entityColumn: "id",
        tableKey: "id",
      },
      MultiDatastreams: {
        type: Erelations.hasMany,
        expand: `"multidatastream"."id" in (select "multidatastream"."id" from "multidatastream" where "multidatastream"."thing_id" = "thing"."id")`,
        link: `"multidatastream"."id" in (select "multidatastream"."id" from "multidatastream" where "multidatastream"."thing_id" = $ID)`,
        entityName: "MultiDatastreams",
        tableName: "multidatastream",
        relationKey: "thing_id",
        entityColumn: "id",
        tableKey: "id",
      },
    },
  },

  FeaturesOfInterest: {
    name: "FeaturesOfInterest",
    singular: "FeatureOfInterest",
    table: "featureofinterest",
    order: 4,
    extensions: [EextensionsType.base],
    orderBy: `"id"`,
    count: makeCount("featureofinterest"),
    visible: true,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return makeIDAlias("featureofinterest");
        },
        type: "number",
      },
      name: {
        create: "text NOT NULL DEFAULT 'no name'::text",
        columnAlias() {
          return `"name"`;
        },
        type: "text",
      },
      description: {
        create: "text NOT NULL DEFAULT 'description'::text",
        columnAlias() {
          return `"description"`;
        },
        type: "text",
      },
      encodingType: {
        create: "text NOT NULL",
        columnAlias() {
          return `"encodingType"`;
        },
        type: "text",
      },
      feature: {
        create: "jsonb NOT NULL",
        columnAlias() {
          return `"feature"`;
        },
        type: "json",
        test: "encodingType",
      },
      properties: {
        create: "jsonb NULL",
        columnAlias() {
          return `"properties"`;
        },
        type: "json",
      },
    },
    canPost: false,
    relations: {
      Observations: {
        type: Erelations.hasMany,
        expand: `"observation"."id" in (select "observation"."id" from "observation" where "observation"."featureofinterest_id" = "featureofinterest"."id")`,
        link: `"observation"."id" in (select "observation"."id" from "observation" where "observation"."featureofinterest_id" = $ID)`,
        entityName: "Observations",
        tableName: "observation",
        relationKey: "featureofinterest_id",
        entityColumn: "id",
        tableKey: "id",
      },
      Datastreams: {
        type: Erelations.hasMany,
        expand: `"datastream"."id" in (select "datastream"."id" from "datastream" where "datastream"."_default_foi" = "featureofinterest"."id")`,
        link: `"datastream"."id" in (select "datastream"."id" from "datastream" where "datastream"."_default_foi" = $ID)`,
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
  },

  Locations: {
    name: "Locations",
    singular: "Location",
    table: "location",
    order: 6,
    extensions: [EextensionsType.base],
    orderBy: `"id"`,
    count: makeCount("location"),
    visible: true,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return makeIDAlias("location");
        },
        type: "number",
      },
      name: {
        create: "text NOT NULL DEFAULT 'no name'::text",
        columnAlias() {
          return `"name"`;
        },
        type: "text",
      },
      description: {
        create: "text NOT NULL DEFAULT 'no description'::text",
        columnAlias() {
          return `"description"`;
        },
        type: "text",
      },
      encodingType: {
        create: "text NOT NULL",
        columnAlias() {
          return `"encodingType"`;
        },
        dataList: {
          GeoJSON: "application/vnd.geo+json",
        },
        type: "list",
      },
      location: {
        create: "jsonb NOT NULL",
        columnAlias() {
          return `"location"`;
        },

        type: "json",
        test: "encodingType",
      },
      geom: {
        create: "geometry NULL",
        columnAlias() {
          return `"geom"`;
        },

        type: "json",
      },
      properties: {
        create: "jsonb NULL",
        columnAlias() {
          return `"properties"`;
        },
        type: "json",
      },
    },
    constraints: {
      location_pkey: 'PRIMARY KEY ("id")',
      location_unik_name: 'UNIQUE ("name")',
    },
    canPost: false,
    relations: {
      Things: {
        type: Erelations.belongsToMany,
        expand: `"thing"."id" in (select "thing_location"."thing_id" from "thing_location" where "thing_location"."location_id" = "location"."id")`,
        link: `"thing"."id" in (select "thing_location"."thing_id" from "thing_location" where "thing_location"."location_id" = $ID)`,
        entityName: "Things",
        tableName: "thing_location",
        relationKey: "location_id",
        entityColumn: "thing_id",
        tableKey: "thing_id",
      },
      HistoricalLocations: {
        type: Erelations.belongsToMany,
        expand: `"historical_location"."id" in (select "historical_location"."id" from "historical_location" where "historical_location"."thing_id" in (select "thing_location"."thing_id" from "thing_location" where "thing_location"."location_id" = "location"."id"))`,
        link: `"historical_location"."id" in (select "historical_location"."id" from "historical_location" where "historical_location"."thing_id" in (select "thing_location"."thing_id" from "thing_location" where "thing_location"."location_id" = $ID))`,
        entityName: "HistoricalLocations",
        tableName: "location_historical_location",
        relationKey: "location_id",
        entityColumn: "id",
        tableKey: "id",
      },
    },
  },

  HistoricalLocations: {
    name: "HistoricalLocations",
    singular: "HistoricalLocation",
    table: "historical_location",
    order: 5,
    extensions: [EextensionsType.base],
    orderBy: `"id"`,
    count: makeCount("historical_location"),
    visible: true,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return makeIDAlias("historical_location");
        },
      },
      time: {
        create: "timestamptz NULL",
        columnAlias() {
          return `"time"`;
        },
      },
      thing_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return `"thing_id"`;
        },
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
    canPost: false,
    relations: {
      // TODO NOT GOOD
      Things: {
        type: Erelations.belongsTo,
        expand: `"thing"."id" = "historical_location"."thing_id"`,
        link: `"thing"."id" = (select "historical_location"."thing_id" from "historical_location" where "historical_location"."id" = $ID)`,
        entityName: "Things",
        tableName: "thing",
        relationKey: "thing_id",
        entityColumn: "id",
        tableKey: "id",
      },
      Locations: {
        type: Erelations.belongsToMany,
        expand: `"location"."id" in (select "location"."id" from "location" where "location"."id" in (select "thing_location"."location_id" from "thing_location" where "thing_location"."thing_id" = "historical_location"."thing_id"))`,
        link: `"location"."id" in (select "location"."id" from "location" where "location"."id" in (select "thing_location"."location_id" from "thing_location" where "thing_location"."thing_id" in (select "historical_location"."thing_id" from "historical_location" where "historical_location"."id" = $ID)))`,
        entityName: "locationsHistoricalLocations",
        tableName: "location_historical_location",
        relationKey: "historical_location_id",
        entityColumn: "location_id",
        tableKey: "location_id",
      },
    },
  },

  locationsHistoricalLocations: {
    name: "locationsHistoricalLocations",
    singular: "locationHistoricalLocation",
    table: "location_historical_location",
    order: -1,
    extensions: [EextensionsType.base],
    orderBy: `"location_id"`,
    count: makeCount("location_historical_location"),
    visible: true,
    columns: {
      location_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return `"location_id"`;
        },
      },
      historical_location_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return `"historical_location_id"`;
        },
      },
    },
    constraints: {
      location_historical_location_pkey:
        'PRIMARY KEY ("location_id", "historical_location_id")',
      location_historical_location_historical_location_id_fkey:
        'FOREIGN KEY ("historical_location_id") REFERENCES "historical_location"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      location_historical_location_location_id_fkey:
        'FOREIGN KEY ("location_id") REFERENCES "location"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      location_historical_location_historical_location_id:
        'ON public."location_historical_location" USING btree ("historical_location_id")',
      location_historical_location_location_id:
        'ON public."location_historical_location" USING btree ("location_id")',
    },
    canPost: false,
    relations: {},
  },

  ObservedProperties: {
    name: "ObservedProperties",
    singular: "ObservedProperty",
    table: "observedproperty",
    order: 8,
    extensions: [EextensionsType.base],
    orderBy: `"id"`,
    count: makeCount("observedproperty"),
    visible: true,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return makeIDAlias("observedproperty");
        },
        type: "number",
      },
      name: {
        create: "text NOT NULL DEFAULT 'no name'::text",
        columnAlias() {
          return `"name"`;
        },
        type: "text",
      },
      definition: {
        create: "text NOT NULL DEFAULT 'definition'::text",
        columnAlias() {
          return `"definition"`;
        },
        type: "text",
      },
      description: {
        create: "text NOT NULL DEFAULT 'description'::text",
        columnAlias() {
          return `"description"`;
        },
        type: "text",
      },
      properties: {
        create: "jsonb NULL",
        columnAlias() {
          return `"properties"`;
        },
        type: "json",
      },
    },
    constraints: {
      observedproperty_pkey: 'PRIMARY KEY ("id")',
      observedproperty_unik_name: 'UNIQUE ("name")',
    },
    canPost: false,
    relations: {
      Datastreams: {
        type: Erelations.hasMany,
        // expand: "err: 501 : Not Implemented.",
        expand: `"datastream"."id" in (select "datastream"."id" from "datastream" where "datastream"."observedproperty_id" = "observedproperty"."id")`,
        link: `"datastream"."id" in (SELECT "datastream"."id" FROM "datastream" WHERE "datastream"."observedproperty_id" = $ID)`,
        entityName: "Datastreams",
        tableName: "datastream",
        relationKey: "observedproperty_id",
        entityColumn: "id",
        tableKey: "id",
      },
      MultiDatastreams: {
        type: Erelations.hasMany,
        expand: `"multidatastream"."id" in (SELECT "multi_datastream_observedproperty"."multidatastream_id" FROM "multi_datastream_observedproperty" WHERE "multi_datastream_observedproperty"."observedproperty_id" = "observedproperty"."id")`,
        link: `"multidatastream"."id" in (SELECT "multi_datastream_observedproperty"."multidatastream_id" FROM "multi_datastream_observedproperty" WHERE "multi_datastream_observedproperty"."observedproperty_id" = $ID)`,
        entityName: "MultiDatastreams",
        tableName: "multi_datastream_observedproperty",
        relationKey: "observedproperty_id",
        entityColumn: "multidatastream_id",
        tableKey: "multidatastream_id",
      },
    },
  },

  Sensors: {
    name: "Sensors",
    singular: "Sensor",
    table: "sensor",
    order: 9,
    extensions: [EextensionsType.base],
    orderBy: `"id"`,
    count: makeCount("sensor"),
    visible: true,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return makeIDAlias("sensor");
        },
        type: "number",
      },
      name: {
        create: "text NOT NULL DEFAULT 'no name'::text",
        columnAlias() {
          return `"name"`;
        },
        type: "text",
      },
      description: {
        create: "text NOT NULL DEFAULT 'no description'::text",
        columnAlias() {
          return `"description"`;
        },
        type: "text",
      },
      encodingType: {
        create: "text NOT NULL",
        columnAlias() {
          return `"encodingType"`;
        },
        dataList: {
          PDF: "application/pdf",
          SensorML: "http://www.opengis.net/doc/IS/SensorML/2.0",
        },
        type: "list",
      },
      metadata: {
        create: "text NOT NULL",
        columnAlias() {
          return `"metadata"`;
        },
        type: "text",
      },
      properties: {
        create: "jsonb NULL",
        columnAlias() {
          return `"properties"`;
        },
        type: "json",
      },
    },
    constraints: {
      sensor_pkey: 'PRIMARY KEY ("id")',
      sensor_unik_name: 'UNIQUE ("name")',
    },
    canPost: false,
    relations: {
      Datastreams: {
        type: Erelations.hasMany,
        expand: `"datastream"."id" in (select "datastream"."id" from "datastream" where "datastream"."id" = "sensor"."id")`,
        link: `"datastream"."id" in (select "datastream"."id" from "datastream" where "datastream"."sensor_id" = $ID)`,
        entityName: "Datastreams",
        tableName: "datastream",
        relationKey: "sensor_id",
        entityColumn: "id",
        tableKey: "id",
      },
      MultiDatastreams: {
        type: Erelations.hasMany,
        expand: `"multidatastream"."id" in (select "multidatastream"."id" from "multidatastream" where "multidatastream"."id" = "sensor"."id")`,
        link: `"multidatastream"."id" in (select "multidatastream"."id" from "multidatastream" where "multidatastream"."sensor_id" = $ID)`,
        entityName: "MultiDatastreams",
        tableName: "multidatastream",
        relationKey: "sensor_id",
        entityColumn: "id",
        tableKey: "id",
      }
    },
  },

  Datastreams: {
    name: "Datastreams",
    singular: "Datastream",
    table: "datastream",
    order: 1,
    extensions: [EextensionsType.base],
    orderBy: `"id"`,
    count: makeCount("datastream"),
    visible: true,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return makeIDAlias("datastream");
        },
        type: "number",
      },
      name: {
        create: "text NOT NULL DEFAULT 'no name'::text",
        columnAlias() {
          return `"name"`;
        },
        type: "text",
      },
      description: {
        create: "text NOT NULL DEFAULT 'no description'::text",
        columnAlias() {
          return `"description"`;
        },
        type: "text",
      },
      observationType: {
        create:
          "text NOT NULL DEFAULT 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement'::text",
        columnAlias() {
          return `"observationType"`;
        },
        type: "list",
        verify: {
          list: Object.keys(EobservationType),
          default:
            "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement",
        },
      },
      unitOfMeasurement: {
        create: "jsonb NOT NULL",
        columnAlias() {
          return `"unitOfMeasurement"`;
        },
        type: "json",
      },
      observedArea: {
        create: "geometry NULL",
        columnAlias() {
          return `"observedArea"`;
        },
        type: "json",
      },
      phenomenonTime: {
        create: "",
        columnAlias() {
          return `CONCAT(\n\t\tto_char("_phenomenonTimeStart",\n\t\t'${EdatesType.date}'),\n\t\t'/',\n\t\tto_char("_phenomenonTimeEnd",\n\t\t'${EdatesType.date}')\n\t) AS "phenomenonTime"`;
        },
        type: "text",
      },
      resultTime: {
        create: "",
        columnAlias() {
          return `CONCAT(\n\t\tto_char("_resultTimeStart",\n\t\t'${EdatesType.date}'),\n\t\t'/',\n\t\tto_char("_resultTimeEnd",\n\t\t'${EdatesType.date}')\n\t) AS "resultTime"`;
        },
        type: "text",
      },
      _phenomenonTimeStart: {
        create: "timestamptz NULL",
        columnAlias() {
          return `"_phenomenonTimeStart"`;
        },
        type: "date",
      },
      _phenomenonTimeEnd: {
        create: "timestamptz NULL",
        columnAlias() {
          return `_"phenomenonTimeEnd"`;
        },
        type: "date",
      },
      _resultTimeStart: {
        create: "timestamptz NULL",
        columnAlias() {
          return `"_resultTimeStart"`;
        },
        type: "date",
      },
      _resultTimeEnd: {
        create: "timestamptz NULL",
        columnAlias() {
          return `"_resultTimeEnd"`;
        },
        type: "date",
      },
      thing_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return `"thing_id"`;
        },
        type: "relation:Things",
      },
      observedproperty_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return `"observedproperty_id"`;
        },
        type: "relation:ObservedProperties",
      },
      sensor_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return `"sensor_id"`;
        },
        type: "relation:Sensor",
      },
      properties: {
        create: "jsonb NULL",
        columnAlias() {
          return `"properties"`;
        },
        type: "json",
      },
      _default_foi: {
        create: "BIGINT NOT NULL DEFAULT 1",
        columnAlias() {
          return `"_default_foi"`;
        },
        type: "relation:FeaturesOfInterest",
      },
    },
    canPost: false,
    relations: {
      Thing: {
        type: Erelations.belongsTo,
        expand: `"thing"."id" = "datastream"."thing_id"`,
        link: `"thing"."id" = (select "datastream"."thing_id" from "datastream" where "datastream"."id" =$ID)`,
        entityName: "Things",
        tableName: "datastream",
        relationKey: "id",
        entityColumn: "thing_id",
        tableKey: "id",
      },
      Sensor: {
        type: Erelations.belongsTo,
        expand: `"sensor"."id" = "datastream"."sensor_id"`,
        link: `"sensor"."id" = (select "datastream"."sensor_id" from "datastream" where "datastream"."id" =$ID)`,

        entityName: "Sensors",
        tableName: "datastream",
        relationKey: "id",
        entityColumn: "sensor_id",
        tableKey: "id",
      },
      ObservedProperty: {
        type: Erelations.belongsTo,
        expand: `"observedproperty"."id" = "datastream"."observedproperty_id"`,
        link: `"observedproperty"."id" = (select "datastream"."observedproperty_id" from "datastream" where "datastream"."id" =$ID)`,
        entityName: "ObservedProperties",
        tableName: "datastream",
        relationKey: "id",
        entityColumn: "observedproperty_id",
        tableKey: "id",
      },
      Observations: {
        type: Erelations.hasMany,
        expand: `"observation"."id" in (select "observation"."id" from "observation" where "observation"."datastream_id" = "datastream"."id" ORDER BY "observation"."resultTime" ASC)`,
        link: `"observation"."id" in (select "observation"."id" from "observation" where "observation"."datastream_id" = $ID ORDER BY "observation"."resultTime" ASC)`,
        entityName: "Observations",
        tableName: "observation",
        relationKey: "datastream_id",
        entityColumn: "id",
        tableKey: "id",
      },
      Loras: {
        type: Erelations.belongsTo,
        expand: `"lora"."id" = (select "lora"."id" from "lora" where "lora"."datastream_id" = "datastream"."id")`,
        link: `"lora"."id" = (select "lora"."id" from "lora" where "lora"."datastream_id" = $ID)`,
        entityName: "loras",
        tableName: "lora",
        relationKey: "datastream_id",
        entityColumn: "id",
        tableKey: "id",
      },
      FeatureOfInterest: {
        type: Erelations.belongsTo,
        expand: "",
        link: "",
        entityName: "FeaturesOfInterest",
        tableName: "featureofinterest",
        relationKey: "_default_foi",
        entityColumn: "id",
        tableKey: "id",
      },
    },
    constraints: {
      datastream_pkey: 'PRIMARY KEY ("id")',
      datastream_unik_name: 'UNIQUE ("name")',
      datastream_observedproperty_id_fkey:
        'FOREIGN KEY ("observedproperty_id") REFERENCES "observedproperty"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      datastream_sensor_id_fkey:
        'FOREIGN KEY ("sensor_id") REFERENCES "sensor"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      datastream_thing_id_fkey:
        'FOREIGN KEY ("thing_id") REFERENCES "thing"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      datastream_featureofinterest_id_fkey:
        'FOREIGN KEY ("_default_foi") REFERENCES "featureofinterest"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      datastream_observedproperty_id:
        'ON public."datastream" USING btree ("observedproperty_id")',
      datastream_sensor_id: 'ON public."datastream" USING btree ("sensor_id")',
      datastream_thing_id: 'ON public."datastream" USING btree ("thing_id")',
    },
  },

  MultiDatastreams: {
    name: "MultiDatastreams",
    singular: "MultiDatastream",
    table: "multidatastream",
    order: 2,
    extensions: [EextensionsType.multiDatastream],
    orderBy: `"id"`,
    count: makeCount("multidatastream"),
    visible: true,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return makeIDAlias("multidatastream");
        },
        type: "number",
      },
      name: {
        create: "text NOT NULL DEFAULT 'no name'::text",
        columnAlias() {
          return `"name"`;
        },
        type: "text",
      },
      description: {
        create: "text NULL",
        columnAlias() {
          return `"description"`;
        },
        type: "text",
      },
      unitOfMeasurements: {
        create: "jsonb NOT NULL",
        columnAlias() {
          return `"unitOfMeasurements"`;
        },
        type: "json",
      },
      observationType: {
        create:
          "text NOT NULL DEFAULT 'http://www.opengis.net/def/observation-type/ogc-om/2.0/om_complex-observation'::text",
        columnAlias() {
          return `"observationType"`;
        },
        type: "list",
        verify: {
          list: Object.keys(EobservationType),
          default:
            "http://www.opengis.net/def/observation-type/ogc-om/2.0/om_complex-observation",
        },
      },
      multiObservationDataTypes: {
        create: "text[] NULL",
        columnAlias() {
          return `"multiObservationDataTypes"`;
        },
        type: "text",
      },
      observedArea: {
        create: "geometry NULL",
        columnAlias() {
          return `"observedArea"`;
        },
        type: "json",
      },
      phenomenonTime: {
        create: "",
        columnAlias() {
          return `CONCAT(\n\t\tto_char("_phenomenonTimeStart",\n\t\t'${EdatesType.date}'),\n\t\t'/',\n\t\tto_char("_phenomenonTimeEnd",\n\t\t'${EdatesType.date}')\n\t) AS "phenomenonTime"`;
        },
        type: "text",
      },
      resultTime: {
        create: "",
        columnAlias() {
          return `CONCAT(\n\t\tto_char("_resultTimeStart",\n\t\t'${EdatesType.date}'),\n\t\t'/',\n\t\tto_char("_resultTimeEnd",\n\t\t'${EdatesType.date}')\n\t) AS "resultTime"`;
        },
        type: "text",
      },
      _phenomenonTimeStart: {
        create: "timestamptz NULL",
        columnAlias() {
          return `"_phenomenonTimeStart"`;
        },
        type: "date",
      },
      _phenomenonTimeEnd: {
        create: "timestamptz NULL",
        columnAlias() {
          return `"_phenomenonTimeEnd"`;
        },
        type: "date",
      },
      _resultTimeStart: {
        create: "timestamptz NULL",
        columnAlias() {
          return `"_resultTimeStart"`;
        },
        type: "date",
      },
      _resultTimeEnd: {
        create: "timestamptz NULL",
        columnAlias() {
          return `"_resultTimeEnd"`;
        },
        type: "date",
      },
      thing_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return `"thing_id"`;
        },
        type: "relation:Things",
      },
      sensor_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return `"sensor_id"`;
        },
        type: "relation:Sensors",
      },
      properties: {
        create: "jsonb NULL",
        columnAlias() {
          return `"properties"`;
        },
        type: "json",
      },
      _default_foi: {
        create: "BIGINT NOT NULL DEFAULT 1",
        columnAlias() {
          return `"_default_foi"`;
        },
      },
    },
    canPost: false,
    relations: {
      Thing: {
        type: Erelations.belongsTo,
        expand: `"thing"."id" = "multidatastream"."thing_id"`,
        link: `"thing"."id" = (select "multidatastream"."thing_id" from "multidatastream" where "multidatastream"."id" =$ID)`,

        entityName: "Things",
        tableName: "multidatastream",
        relationKey: "id",
        entityColumn: "thing_id",
        tableKey: "id",
      },
      Sensor: {
        type: Erelations.belongsTo,
        expand: `"sensor"."id" = "multidatastream"."sensor_id"`,
        link: `"sensor"."id" = (select "multidatastream"."sensor_id" from "multidatastream" where "multidatastream"."id" =$ID)`,
        entityName: "Sensors",
        tableName: "multidatastream",
        relationKey: "id",
        entityColumn: "sensor_id",
        tableKey: "id",
      },
      Observations: {
        type: Erelations.hasMany,
        expand: `"observation"."id" in (select "observation"."id" from "observation" where "observation"."multidatastream_id" = "multidatastream"."id")`,
        link: `"observation"."id" in (select "observation"."id" from "observation" where "observation"."multidatastream_id" = $ID)`,

        entityName: "Observations",
        tableName: "observation",
        relationKey: "multidatastream_id",
        entityColumn: "id",
        tableKey: "id",
      },
      ObservedProperties: {
        type: Erelations.belongsTo,
        expand: `"observedproperty"."id" in (SELECT "multi_datastream_observedproperty"."observedproperty_id" FROM "multi_datastream_observedproperty" WHERE "multi_datastream_observedproperty"."multidatastream_id" = "multidatastream"."id")`,
        link: `"observedproperty"."id" in (SELECT "multi_datastream_observedproperty"."observedproperty_id" FROM "multi_datastream_observedproperty" WHERE "multi_datastream_observedproperty"."multidatastream_id" = $ID)`,
        entityName: "ObservedProperties",
        tableName: "multi_datastream_observedproperty",
        relationKey: "observedproperty_id",
        entityColumn: "multidatastream_id",
        tableKey: "multidatastream_id",
      },
      Loras: {
        type: Erelations.belongsTo,
        expand: `"lora"."id" = (select "lora"."id" from "lora" where "lora"."multidatastream_id" = "multidatastream"."id")`,
        link: `"lora"."id" = (select "lora"."id" from "lora" where "lora"."multidatastream_id" = $ID)`,
        entityName: "loras",
        tableName: "lora",
        relationKey: "multidatastream_id",
        entityColumn: "id",
        tableKey: "id",
      },
      FeatureOfInterest: {
        type: Erelations.belongsTo,
        expand: "",
        link: "",
        entityName: "FeaturesOfInterest",
        tableName: "featureofinterest",
        relationKey: "_default_foi",
        entityColumn: "id",
        tableKey: "id",
      },
    },
    constraints: {
      multidatastream_pkey: 'PRIMARY KEY ("id")',
      multidatastream_unik_name: 'UNIQUE ("name")',
      multidatastream_sensor_id_fkey:
        'FOREIGN KEY ("sensor_id") REFERENCES "sensor"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      multidatastream_thing_id_fkey:
        'FOREIGN KEY ("thing_id") REFERENCES "thing"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      multidatastream_featureofinterest_id_fkey:
        'FOREIGN KEY ("_default_foi") REFERENCES "featureofinterest"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      multidatastream_sensor_id:
        'ON public."multidatastream" USING btree ("sensor_id")',
      multidatastream_thing_id:
        'ON public."multidatastream" USING btree ("thing_id")',
    },
  },

  MultiDatastreamObservedProperties: {
    name: "MultiDatastreamObservedProperties",
    singular: "MultiDatastreamObservedProperty",
    table: "multi_datastream_observedproperty",
    order: -1,
    extensions: [EextensionsType.multiDatastream],
    orderBy: `"multidatastream_id"`,
    count: makeCount("multi_datastream_observedproperty"),
    visible: true,
    columns: {
      multidatastream_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return `"multidatastream_id"`;
        },
      },
      observedproperty_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return `"observedproperty_id"`;
        },
      },
    },
    canPost: false,
    relations: {},
    constraints: {
      multi_datastream_observedproperty_pkey:
        'PRIMARY KEY ("multidatastream_id", "observedproperty_id")',
      multi_datastream_observedproperty_multidatastream_id_fkey:
        'FOREIGN KEY ("multidatastream_id") REFERENCES "multidatastream"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      multi_datastream_observedproperty_observedproperty_id_fkey:
        'FOREIGN KEY ("observedproperty_id") REFERENCES "observedproperty"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      multi_datastream_observedproperty_multidatastream_id:
        'ON public."multi_datastream_observedproperty" USING btree ("multidatastream_id")',
      multi_datastream_observedproperty_observedproperty_id:
        'ON public."multi_datastream_observedproperty" USING btree ("observedproperty_id")',
    },
  },

  Observations: {
    name: "Observations",
    singular: "Observation",
    table: "observation",
    order: 7,
    extensions: [EextensionsType.base],
    orderBy: `"phenomenonTime"`,
    count: makeCount("observation"),
    visible: true,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return makeIDAlias("observation");
        },
        type: "number",
      },
      phenomenonTime: {
        create: "timestamptz NOT NULL",
        columnAlias() {
          return `"phenomenonTime"`;
        },
        type: "date",
      },
      result: {
        create: "jsonb NULL",
        columnAlias(test: boolean[] | undefined) {
          return test
            ? test[1] === true
              ? `"result"-> 'valueskeys'->'soil moisture' AS "soil moisture"`
              : test[0] === true
              ? `coalesce("result"-> 'valueskeys', "result"-> 'value') AS result`
              : `"result"-> 'value' AS result`
            : "result";
        },
        type: "number",
      },
      resultTime: {
        create: "timestamptz NOT NULL",
        columnAlias() {
          return `"resultTime"`;
        },
        type: "date",
      },
      resultQuality: {
        create: "jsonb NULL",
        columnAlias() {
          return `"resultQuality"`;
        },
        type: "json",
      },
      validTime: {
        create: "timestamptz DEFAULT CURRENT_TIMESTAMP",
        columnAlias() {
          return `"validTime"`;
        },
        type: "date",
      },
      parameters: {
        create: "jsonb NULL",
        columnAlias() {
          return `"parameters"`;
        },
        type: "json",
      },
      datastream_id: {
        create: "BIGINT NULL",
        columnAlias() {
          return `"datastream_id"`;
        },
        type: "relation:Datastreams",
      },
      multidatastream_id: {
        create: "BIGINT NULL",
        columnAlias() {
          return `"multidatastream_id"`;
        },
        type: "relation:MultiDatastreams",
      },
      featureofinterest_id: {
        create: "BIGINT NOT NULL DEFAULT 1",
        columnAlias() {
          return `"featureofinterest_id"`;
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
    canPost: false,
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
  },

  HistoricalObservations: {
    name: "HistoricalObservations",
    singular: "HistoricalObservation",
    table: "historical_observation",
    order: -1,
    extensions: [EextensionsType.base],
    orderBy: `"id"`,
    count: makeCount("historical_observation"),
    visible: false,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return makeIDAlias("historical_observation");
        },
      },
      validTime: {
        create: "timestamptz DEFAULT CURRENT_TIMESTAMP",
        columnAlias() {
          return `"validTime"`;
        },
      },
      _result: {
        create: "jsonb NULL",
        columnAlias() {
          return `"_result"`;
        },
      },
      observation_id: {
        create: "BIGINT NULL",
        columnAlias() {
          return `"observation_id"`;
        },
      },
    },
    constraints: {
      HistoricalObservations_pkey: 'PRIMARY KEY ("id")',
      HistoricalObservations_id_fkey:
        'FOREIGN KEY ("observation_id") REFERENCES "observation"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      HistoricalObservations_observation_id:
        'ON public."historical_observation" USING btree ("observation_id")',
    },
    canPost: false,
    relations: {
      Observations: {
        type: Erelations.belongsTo,
        expand: `"observation"."id" = "historical_observation"."observation_id"`,
        link: "err: 501 : Not Implemented.",

        entityName: "Observations",
        tableName: "observation",
        relationKey: "observation_id",
        entityColumn: "id",
        tableKey: "id",
      },
    },
  },

  ThingsLocations: {
    name: "ThingsLocations",
    singular: "ThingLocation",
    table: "thing_location",
    order: -1,
    extensions: [EextensionsType.base],
    orderBy: `"thing_id"`,
    count: makeCount("thing_location"),
    visible: false,
    columns: {
      thing_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return `"thing_id"`;
        },
      },
      location_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return `"location_id"`;
        },
      },
    },
    canPost: false,
    relations: {},
    constraints: {
      thing_location_pkey: 'PRIMARY KEY ("thing_id", "location_id")',
      thing_location_location_id_fkey:
        'FOREIGN KEY ("location_id") REFERENCES "location"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      thing_location_thing_id_fkey:
        'FOREIGN KEY ("thing_id") REFERENCES "thing"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      thing_location_location_id:
        'ON public."thing_location" USING btree ("location_id")',
      thing_location_thing_id:
        'ON public."thing_location" USING btree ("thing_id")',
    },
  },

  Decoders: {
    name: "Decoders",
    singular: "Decoder",
    table: "decoder",
    order: 12,
    extensions: [EextensionsType.lora],
    orderBy: `"id"`,
    count: makeCount("decoder"),
    visible: true,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return makeIDAlias("decoder");
        },
        type: "number",
      },
      name: {
        create: "text NOT NULL DEFAULT 'no name'::text",
        columnAlias() {
          return `"name"`;
        },
        type: "text",
      },
      hash: {
        create: "text NULL",
        columnAlias() {
          return `"hash"`;
        },
        type: "text",
      },
      code: {
        create:
          "text NOT NULL DEFAULT 'const decoded = null; return decoded;'::text",
        columnAlias() {
          return `"code"`;
        },
        type: "text",
      },
      nomenclature: {
        create: "text NOT NULL DEFAULT '{}'::text",
        columnAlias() {
          return `"nomenclature"`;
        },
        type: "jsonb",
      },
      synonym: {
        create: "text NULL",
        columnAlias() {
          return `"synonym"`;
        },
        type: "jsonb",
      },
    },
    constraints: {
      decoder_pkey: 'PRIMARY KEY ("id")',
      decoder_unik_name: 'UNIQUE ("name")',
    },
    canPost: false,
    relations: {
      Loras: {
        type: Erelations.hasMany,
        expand: `"lora"."id" in (select "lora"."id" from "lora" where "lora"."decoder_id" = "decoder"."id")`,
        link: `"lora"."id" in (select "lora"."id" from "lora" where "lora"."decoder_id" = $ID)`,
        entityName: "Loras",
        tableName: "lora",
        relationKey: "decoder_id",
        entityColumn: "id",
        tableKey: "id",
      },
    },
  },

  Loras: {
    name: "Loras",
    singular: "Lora",
    table: "lora",
    order: 11,
    extensions: [EextensionsType.lora],
    orderBy: `"id"`,
    count: makeCount("lora"),
    visible: true,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return makeIDAlias("lora");
        },
        type: "number",
      },
      name: {
        create: "text NOT NULL DEFAULT 'no name'::text",
        columnAlias() {
          return `"name"`;
        },
        type: "text",
      },
      description: {
        create: "text NOT NULL DEFAULT 'no description'::text",
        columnAlias() {
          return `"description"`;
        },
        type: "text",
      },
      properties: {
        create: "jsonb NULL",
        columnAlias() {
          return `"properties"`;
        },
        type: "json",
      },
      deveui: {
        create: "text NOT NULL",
        columnAlias() {
          return `"deveui"`;
        },
        type: "text",
      },
      decoder_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return `"decoder_id"`;
        },
        type: "relation:Decoders",
      },
      datastream_id: {
        create: "BIGINT NULL",
        columnAlias() {
          return `"datastream_id"`;
        },
        type: "relation:Datastreams",
      },
      multidatastream_id: {
        create: "BIGINT NULL",
        columnAlias() {
          return `"multidatastream_id"`;
        },
        type: "relation:MultiDatastreams",
      },
    },
    constraints: {
      lora_pkey: 'PRIMARY KEY ("id")',
      lora_unik_deveui: 'UNIQUE ("deveui")',
      // lora_datastream_id_fkey: 'FOREIGN KEY ("datastream_id") REFERENCES "datastream"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      lora_multidatastream_id_fkey:
        'FOREIGN KEY ("multidatastream_id") REFERENCES "multidatastream"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      lora_decoder_fkey:
        'FOREIGN KEY ("decoder_id") REFERENCES "decoder"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      lora_datastream_id: 'ON public."lora" USING btree ("datastream_id")',
      lora_multidatastream_id:
        'ON public."lora" USING btree ("multidatastream_id")',
      decoder_id: 'ON public."lora" USING btree ("decoder_id")',
    },
    canPost: false,
    relations: {
      Datastream: {
        type: Erelations.belongsTo,
        expand: `"datastream"."id" = "lora"."datastream_id"`,
        link: `"datastream"."id" = (SELECT "lora"."datastream_id" FROM "lora" WHERE "lora"."id" = $ID)`,
        entityName: "Datastreams",
        tableName: "lora",
        relationKey: "id",
        entityColumn: "datastream_id",
        tableKey: "id",
      },
      MultiDatastream: {
        type: Erelations.belongsTo,
        expand: `"multidatastream"."id" = "lora"."multidatastream_id"`,
        link: `"multidatastream"."id" = (SELECT "lora"."multidatastream_id" FROM "lora" WHERE "lora"."id" = $ID)`,
        entityName: "MultiDatastreams",
        tableName: "lora",
        relationKey: "id",
        entityColumn: "multidatastream_id",
        tableKey: "id",
      },
      Decoder: {
        type: Erelations.belongsTo,
        expand: `"decoder"."id" = "lora"."decoder_id"`,
        link: `"decoder"."id" = (SELECT "lora"."decoder_id" FROM "lora" WHERE "lora"."id" = $ID)`,
        entityName: "Decoders",
        tableName: "lora",
        relationKey: "id",
        entityColumn: "decoder_id",
        tableKey: "id",
      },
    },
  },

  Logs: {
    name: "Logs",
    singular: "Log",
    table: "logs",
    order: -1,
    canPost: true,
    extensions: [EextensionsType.logger],
    orderBy: `"date DESC"`,
    count: makeCount("logs"),
    visible: true,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return makeIDAlias("logs");
        },
        type: "number",
      },
      date: {
        create: "timestamptz DEFAULT CURRENT_TIMESTAMP",
        columnAlias() {
          return `"date"`;
        },
        type: "date",
      },
      user_id: {
        create: "BIGINT",
        columnAlias() {
          return `"user_id"`;
        },
        type: "number",
      },
      method: {
        create: "text",
        columnAlias() {
          return `"method"`;
        },
        type: "text",
      },
      code: {
        create: "INT",
        columnAlias() {
          return `"code"`;
        },
        type: "number",
      },
      url: {
        create: "text NOT NULL",
        columnAlias() {
          return `"url"`;
        },
        type: "text",
      },
      datas: {
        create: "jsonb NULL",
        columnAlias() {
          return `"datas"`;
        },
        type: "json",
      },
      database: {
        create: "text NULL",
        columnAlias() {
          return `"database"`;
        },
        type: "text",
      },
      returnid: {
        create: "text NULL",
        columnAlias() {
          return `"returnid"`;
        },
        type: "text",
      },
      error: {
        create: "text NULL",
        columnAlias() {
          return `"error"`;
        },
        type: "text",
      },
    },
    relations: {},
  },

  Users: {
    name: "Users",
    singular: "User",
    table: "user",
    order: 21,
    canPost: true,
    extensions: [EextensionsType.admin],
    orderBy: `"name"`,
    count: makeCount("user"),
    visible: false,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias() {
          return `"id"`;
        },
      },
      username: {
        create: "text NOT NULL UNIQUE",
        columnAlias() {
          return `"username"`;
        },
      },
      email: {
        create: "text NOT NULL",
        columnAlias() {
          return `"email"`;
        },
      },
      password: {
        create: "text NOT NULL",
        columnAlias() {
          return `"password"`;
        },
      },
      database: {
        create: "text NOT NULL",
        columnAlias() {
          return `"database"`;
        },
      },
      canPost: {
        create: "bool NULL",
        columnAlias() {
          return `"canPost"`;
        },
      },
      canDelete: {
        create: "bool NULL",
        columnAlias() {
          return `"canDelete"`;
        },
      },
      canCreateUser: {
        create: "bool NULL",
        columnAlias() {
          return `"canCreateUser"`;
        },
      },
      canCreateDb: {
        create: "bool NULL",
        columnAlias() {
          return `"canCreateDb"`;
        },
      },
      admin: {
        create: "bool NULL",
        columnAlias() {
          return `"admin"`;
        },
      },
      superAdmin: {
        create: "bool NULL",
        columnAlias() {
          return `"superAdmin"`;
        },
      },
    },
    relations: {},
  },

  Configs: {
    name: "Configs",
    singular: "Config",
    table: "",
    order: -1,
    extensions: [EextensionsType.logger, EextensionsType.admin],
    orderBy: `"name"`,
    count: makeCount("config"),
    visible: false,
    columns: {},
    canPost: true,
    relations: {},
    constraints: {},
    indexes: {},
  },

  CreateObservations: {
    name: "CreateObservations",
    singular: "CreateObservation",
    table: "",
    order: 0,
    extensions: [EextensionsType.base],
    orderBy: "",
    count: "",
    visible: true,
    columns: {},
    canPost: true,
    relations: {},
    constraints: {},
    indexes: {},
  },

  CreateFile: {
    name: "CreateFile",
    singular: "CreateFile",
    table: "",
    order: 0,
    extensions: [EextensionsType.base],
    orderBy: "",
    count: "",
    visible: true,
    columns: {},
    canPost: true,
    relations: {},
    constraints: {},
    indexes: {},
  },
};

export const _DB = Object.freeze(dbDatas);
export const _DBFILTERED = (input: koa.Context) => Object.fromEntries( Object.entries(_DB) .filter( ([k]) => getEntitesListFromContext(input) .includes(k) || (_DB[k].extensions.includes(EextensionsType.logger) && input._user.id > 0))); export const _DBADMIN = Object.fromEntries( Object.entries(_DB).filter(([, v]) => v.extensions.includes(EextensionsType.admin) ) );