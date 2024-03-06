import { serverConfig } from "../configuration";
import { TEST } from "../constants";
import { log } from "../log";
import { _STREAM } from "../db/constants";
import { executeSqlValues } from "../db/helpers";
import { queryAsJson } from "../db/queries";
import { EcolType, EdatesType, EextensionsType, EmodelType, EobservationType, Erelations } from "../enums";
import { addDoubleQuotes, deepClone, isTest } from "../helpers";
import { errors, msg } from "../messages";
import { IconfigFile, Ientities, Ientity, IKeyBoolean, Isecurity, IstreamInfos } from "../types";
import koa from "koa";
import fs from "fs";
import { formatLog } from "../logger";
import conformance from "./conformance.json";


const testVersion = (input: string) => Object.keys(Models.models).includes(input);
function makeIDAlias(alias: boolean | undefined) { return `"id"${alias && alias  === true ? ` AS "@iot.id"`: ''}` };

class Models {
  static models : { [key: string]: Ientities; } = {};
  // Create Object FOR v1.0
  constructor() { 
      Models.models[EmodelType.v1_0] = {
          Things: {
            name: "Things",
            singular: "Thing",
            table: "thing",
            createOrder: 1,
            order: 10,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("thing"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias(config: IconfigFile, test: IKeyBoolean) {
                  return makeIDAlias(test["alias"] === true);
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
            canPost: false,
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
          },
        
          FeaturesOfInterest: {
            name: "FeaturesOfInterest",
            singular: "FeatureOfInterest",
            table: "featureofinterest",
            createOrder: 4,
            order: 4,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("featureofinterest"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias(config: IconfigFile, test: IKeyBoolean) {
                  return makeIDAlias(test["alias"] === true);
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
            canPost: false,
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
              "INSERT INTO featureofinterest (name, description, \"encodingType\", feature) VALUES ('Default Feature of Interest', 'Default Feature of Interest', 'application/geo+json', '{}');",
          },
        
          Locations: {
            name: "Locations",
            singular: "Location",
            table: "location",
            createOrder: 2,
            order: 6,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("location"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias(config: IconfigFile, test: IKeyBoolean) {
                  return makeIDAlias(test["alias"] === true);
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
                  GeoJSON: "application/geo+json",
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
            canPost: false,
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
          },
        
          HistoricalLocations: {
            name: "HistoricalLocations",
            singular: "HistoricalLocation",
            table: "historical_location",
            createOrder: -1,
            order: 5,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("historical_location"),
            visible: false,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias(config: IconfigFile, test: IKeyBoolean) {
                  return makeIDAlias(test["alias"] === true);
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
            canPost: false,
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
          },
        
          locationsHistoricalLocations: {
            name: "locationsHistoricalLocations",
            singular: "locationHistoricalLocation",
            table: "location_historical_location",
            createOrder: -1,
            order: -1,
            extensions: [EextensionsType.base],
            orderBy: `"location_id"`,
            count: this.makeCount("location_historical_location"),
            visible: true,
            columns: {
              location_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "bigint"
              },
              historical_location_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "bigint"
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
            createOrder: 5,
            order: 8,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("observedproperty"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias(config: IconfigFile, test: IKeyBoolean) {
                  return makeIDAlias(test["alias"] === true);
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
              definition: {
                create: "text NOT NULL DEFAULT 'definition'::text",
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
                expand: `"datastream"."id" in (SELECT "datastream"."id" from "datastream" WHERE "datastream"."observedproperty_id" = "observedproperty"."id")`,
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
            createOrder: 6,
            order: 9,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("sensor"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias(config: IconfigFile, test: IKeyBoolean) {
                  return makeIDAlias(test["alias"] === true);
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
            canPost: false,
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
          },
        
          Datastreams: {
            name: "Datastreams",
            singular: "Datastream",
            table: "datastream",
            createOrder: 7,
            order: 1,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("datastream"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias(config: IconfigFile, test: IKeyBoolean) {
                  return makeIDAlias(test["alias"] === true);
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
              observationType: {
                create:
                  "text NOT NULL DEFAULT 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement'::text",
                columnAlias() {
                  return undefined;
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
                  return undefined;
                },
                type: "json",
              },
              observedArea: {
                create: "geometry NULL",
                columnAlias() {
                  return undefined;
                },
                type: "json",
              },
              phenomenonTime: {
                create: "",
                columnAlias(config: IconfigFile, test: IKeyBoolean | undefined) {          
                  return `CONCAT(to_char("_phenomenonTimeStart",'${EdatesType.date}'),'/',to_char("_phenomenonTimeEnd",'${EdatesType.date}'))${test && test["as"] === true ? ` AS "phenomenonTime"`: ''}`;
                },
                type: "text",
              },
              resultTime: {
                create: "",
                columnAlias(config: IconfigFile, test: IKeyBoolean | undefined) {
                  return `CONCAT(to_char("_resultTimeStart",'${EdatesType.date}'),'/',to_char("_resultTimeEnd",'${EdatesType.date}'))${test && test["as"] === true ? ` AS "resultTime"`: ''}`;
                },
                type: "text",
              },
              _phenomenonTimeStart: {
                create: "timestamptz NULL",
                columnAlias() {
                  return undefined;
                },
                type: "date",
              },
              _phenomenonTimeEnd: {
                create: "timestamptz NULL",
                columnAlias() {
                  return undefined;
                },
                type: "date",
              },
              _resultTimeStart: {
                create: "timestamptz NULL",
                columnAlias() {
                  return undefined;
                },
                type: "date",
              },
              _resultTimeEnd: {
                create: "timestamptz NULL",
                columnAlias() {
                  return undefined;
                },
                type: "date",
              },
              thing_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "relation:Things",
              },
              observedproperty_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "relation:ObservedProperties",
              },
              sensor_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "relation:Sensor",
              },
              _default_foi: {
                create: "BIGINT NOT NULL DEFAULT 1",
                columnAlias() {
                  return undefined;
                },
                type: "relation:FeaturesOfInterest",
              },
            },
            canPost: false,
            relations: {
              Thing: {
                type: Erelations.belongsTo,
                expand: `"thing"."id" = "datastream"."thing_id"`,
                link: `"thing"."id" = (SELECT "datastream"."thing_id" from "datastream" WHERE "datastream"."id" =$ID)`,
                entityName: "Things",
                tableName: "datastream",
                relationKey: "id",
                entityColumn: "thing_id",
                tableKey: "id",
              },
              Sensor: {
                type: Erelations.belongsTo,
                expand: `"sensor"."id" = "datastream"."sensor_id"`,
                link: `"sensor"."id" = (SELECT "datastream"."sensor_id" from "datastream" WHERE "datastream"."id" =$ID)`,        
                entityName: "Sensors",
                tableName: "datastream",
                relationKey: "id",
                entityColumn: "sensor_id",
                tableKey: "id",
              },
              ObservedProperty: {
                type: Erelations.belongsTo,
                expand: `"observedproperty"."id" = "datastream"."observedproperty_id"`,
                link: `"observedproperty"."id" = (SELECT "datastream"."observedproperty_id" from "datastream" WHERE "datastream"."id" =$ID)`,
                entityName: "ObservedProperties",
                tableName: "datastream",
                relationKey: "id",
                entityColumn: "observedproperty_id",
                tableKey: "id",
              },
              Observations: {
                type: Erelations.hasMany,
                expand: `"observation"."id" in (SELECT "observation"."id" from "observation" WHERE "observation"."datastream_id" = "datastream"."id" ORDER BY "observation"."resultTime" ASC)`,
                link: `"observation"."id" in (SELECT "observation"."id" from "observation" WHERE "observation"."datastream_id" = $ID ORDER BY "observation"."resultTime" ASC)`,
                entityName: "Observations",
                tableName: "observation",
                relationKey: "datastream_id",
                entityColumn: "id",
                tableKey: "id",
              },
              Lora: {
                type: Erelations.belongsTo,
                expand: `"lora"."id" = (SELECT "lora"."id" from "lora" WHERE "lora"."datastream_id" = "datastream"."id")`,
                link: `"lora"."id" = (SELECT "lora"."id" from "lora" WHERE "lora"."datastream_id" = $ID)`,
                entityName: "Loras",
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
            createOrder: 8,
            order: 2,
            extensions: [EextensionsType.multiDatastream],
            orderBy: `"id"`,
            count: this.makeCount("multidatastream"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias(config: IconfigFile, test: IKeyBoolean) {
                  return makeIDAlias(test["alias"] === true);
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
                create: "text NULL",
                columnAlias() {
                  return undefined;
                },
                type: "text",
              },
              unitOfMeasurements: {
                create: "jsonb NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "json",
              },
              observationType: {
                create:
                  "text NOT NULL DEFAULT 'http://www.opengis.net/def/observation-type/ogc-om/2.0/om_complex-observation'::text",
                columnAlias() {
                  return undefined;
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
                  return undefined;
                },
                type: "text[]",
              },
              observedArea: {
                create: "geometry NULL",
                columnAlias() {
                  return undefined;
                },
                type: "json",
              },
              phenomenonTime: {
                create: "",
                columnAlias(config: IconfigFile, test: IKeyBoolean | undefined) {  
                  return `CONCAT(to_char("_phenomenonTimeStart",'${EdatesType.date}'),'/',to_char("_phenomenonTimeEnd",'${EdatesType.date}'))${test && test["as"] === true ? ` AS "phenomenonTime"`: ''}`;
                },
                type: "text",
              },
              resultTime: {
                create: "",
                columnAlias(config: IconfigFile, test: IKeyBoolean | undefined) {  
                  return `CONCAT(to_char("_resultTimeStart",'${EdatesType.date}'),'/',to_char("_resultTimeEnd",'${EdatesType.date}'))${test && test["as"] === true ? ` AS "resultTime"`: ''}`;
                },
                type: "text",
              },
              _phenomenonTimeStart: {
                create: "timestamptz NULL",
                columnAlias() {
                  return undefined;
                },
                type: "date",
              },
              _phenomenonTimeEnd: {
                create: "timestamptz NULL",
                columnAlias() {
                  return undefined;
                },
                type: "date",
              },
              _resultTimeStart: {
                create: "timestamptz NULL",
                columnAlias() {
                  return undefined;
                },
                type: "date",
              },
              _resultTimeEnd: {
                create: "timestamptz NULL",
                columnAlias() {
                  return undefined;
                },
                type: "date",
              },
              thing_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "relation:Things",
              },
              sensor_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "relation:Sensors",
              },
              _default_foi: {
                create: "BIGINT NOT NULL DEFAULT 1",
                columnAlias() {
                  return undefined;
                },
                type: "bigint"
              },
            },
            canPost: false,
            relations: {
              Thing: {
                type: Erelations.belongsTo,
                expand: `"thing"."id" = "multidatastream"."thing_id"`,
                link: `"thing"."id" = (SELECT "multidatastream"."thing_id" from "multidatastream" WHERE "multidatastream"."id" =$ID)`,        
                entityName: "Things",
                tableName: "multidatastream",
                relationKey: "id",
                entityColumn: "thing_id",
                tableKey: "id",
              },
              Sensor: {
                type: Erelations.belongsTo,
                expand: `"sensor"."id" = "multidatastream"."sensor_id"`,
                link: `"sensor"."id" = (SELECT "multidatastream"."sensor_id" from "multidatastream" WHERE "multidatastream"."id" =$ID)`,
                entityName: "Sensors",
                tableName: "multidatastream",
                relationKey: "id",
                entityColumn: "sensor_id",
                tableKey: "id",
              },
              Observations: {
                type: Erelations.hasMany,
                expand: `"observation"."id" in (SELECT "observation"."id" from "observation" WHERE "observation"."multidatastream_id" = "multidatastream"."id")`,
                link: `"observation"."id" in (SELECT "observation"."id" from "observation" WHERE "observation"."multidatastream_id" = $ID)`,
        
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
              Lora: {
                type: Erelations.belongsTo,
                expand: `"lora"."id" = (SELECT "lora"."id" from "lora" WHERE "lora"."multidatastream_id" = "multidatastream"."id")`,
                link: `"lora"."id" = (SELECT "lora"."id" from "lora" WHERE "lora"."multidatastream_id" = $ID)`,
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
            createOrder: 9,
            order: -1,
            extensions: [EextensionsType.multiDatastream],
            orderBy: `"multidatastream_id"`,
            count: this.makeCount("multi_datastream_observedproperty"),
            visible: false,
            columns: {
              multidatastream_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "bigint"
              },
              observedproperty_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "bigint"
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
            createOrder: 12,
            order: 7,
            extensions: [EextensionsType.base],
            orderBy: `"phenomenonTime"`,
            count: this.makeCount("observation"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias(config: IconfigFile, test: IKeyBoolean) {
                  return makeIDAlias(test["alias"] === true);
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
                    return`CASE WHEN jsonb_typeof("result"-> 'value') = 'number' THEN ("result"->>'value')::numeric END${test && test["as"] === true ? ` AS "result"`: ''}`;
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

              payload: {
                create: "",
                extensions: EextensionsType.lora,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                columnAlias(config: IconfigFile, test: IKeyBoolean | undefined) {
                  return config.extensions.includes(EextensionsType.lora)
                  ? `CASE WHEN result->'payload' notnull THEN result->>'payload' WHEN result->'valueskeys' notnull THEN result->>'valueskeys' WHEN result->'value' notnull THEN result->>'value' END AS payload` 
                  : ""; },
                type: "string",
              },
              deveui: {
                create: "",
                extensions: EextensionsType.lora,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                columnAlias(config: IconfigFile, test: IKeyBoolean | undefined) {
                  return config.extensions.includes(EextensionsType.lora)
                  ? `CASE WHEN multidatastream_id NOTNULL THEN (SELECT deveui FROM lora WHERE multidatastream_id = observation.multidatastream_id) WHEN datastream_id NOTNULL THEN (SELECT deveui FROM lora WHERE datastream_id = observation.datastream_id) END AS deveui`
                  : "";
                },
                type: "string",
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
            createOrder: -1,
            order: -1,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("historical_observation"),
            visible: false,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias(config: IconfigFile, test: IKeyBoolean) {
                  return makeIDAlias(test["alias"] === true);
                },
                type: "bigint"
              },
              validTime: {
                create: "timestamptz DEFAULT CURRENT_TIMESTAMP",
                columnAlias() {
                  return undefined;
                },
                type: "date"
              },
              _result: {
                create: "jsonb NULL",
                columnAlias() {
                  return undefined;
                },
                type: "json"
              },
              observation_id: {
                create: "BIGINT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "bigint"
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
            createOrder: 3,
            order: -1,
            extensions: [EextensionsType.base],
            orderBy: `"thing_id"`,
            count: this.makeCount("thing_location"),
            visible: false,
            columns: {
              thing_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "bigint"
              },
              location_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "bigint"
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
            createOrder: 10,
            order: 12,
            extensions: [EextensionsType.lora],
            orderBy: `"id"`,
            count: this.makeCount("decoder"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias(config: IconfigFile, test: IKeyBoolean) {
                  return makeIDAlias(test["alias"] === true);
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
              hash: {
                create: "text NULL",
                columnAlias() {
                  return undefined;
                },
                type: "text",
              },
              code: {
                create:
                  "text NOT NULL DEFAULT 'const decoded = null; return decoded;'::text",
                columnAlias() {
                  return undefined;
                },
                type: "text",
              },
              nomenclature: {
                create: "text NOT NULL DEFAULT '{}'::text",
                columnAlias() {
                  return undefined;
                },
                type: "jsonb",
              },
              synonym: {
                create: "text NULL",
                columnAlias() {
                  return undefined;
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
                expand: `"lora"."id" in (SELECT "lora"."id" from "lora" WHERE "lora"."decoder_id" = "decoder"."id")`,
                link: `"lora"."id" in (SELECT "lora"."id" from "lora" WHERE "lora"."decoder_id" = $ID)`,
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
            createOrder: 11,
            order: 11,
            extensions: [EextensionsType.lora],
            orderBy: `"id"`,
            count: this.makeCount("lora"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias(config: IconfigFile, test: IKeyBoolean) {
                  return makeIDAlias(test["alias"] === true);
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
              properties: {
                create: "jsonb NULL",
                columnAlias() {
                  return undefined;
                },
                type: "json",
              },
              deveui: {
                create: "text NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "text",
              },
              decoder_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "relation:Decoders",
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
            },
            constraints: {
              lora_pkey: 'PRIMARY KEY ("id")',
              lora_unik_deveui: 'UNIQUE ("deveui")',
              lora_datastream_unik_id: 'UNIQUE ("datastream_id")',
              lora_multidatastream_unik_id: 'UNIQUE ("multidatastream_id")',
              lora_datastream_fkey: 'FOREIGN KEY ("datastream_id") REFERENCES "datastream"("id") ON UPDATE CASCADE ON DELETE CASCADE',
              lora_multidatastream_fkey: 'FOREIGN KEY ("multidatastream_id") REFERENCES "multidatastream"("id") ON UPDATE CASCADE ON DELETE CASCADE',
              lora_decoder_fkey: 'FOREIGN KEY ("decoder_id") REFERENCES "decoder"("id") ON UPDATE CASCADE ON DELETE CASCADE',
            },
            indexes: {
              lora_datastream_id: 'ON public."lora" USING btree ("datastream_id")',
              lora_multidatastream_id: 'ON public."lora" USING btree ("multidatastream_id")',
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
            createOrder: -1,
            order: -1,
            canPost: true,
            extensions: [EextensionsType.logs],
            orderBy: `"date DESC"`,
            count: this.makeCount("logs"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias(config: IconfigFile, test: IKeyBoolean) {
                  return makeIDAlias(test["alias"] === true);
                },
                type: "number",
              },
              date: {
                create: "timestamptz DEFAULT CURRENT_TIMESTAMP",
                columnAlias() {
                  return undefined;
                },
                type: "date",
              },
              user_id: {
                create: "BIGINT",
                columnAlias() {
                  return undefined;
                },
                type: "number",
              },
              method: {
                create: "text",
                columnAlias() {
                  return undefined;
                },
                type: "text",
              },
              code: {
                create: "INT",
                columnAlias() {
                  return undefined;
                },
                type: "number",
              },
              url: {
                create: "text NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "text",
              },
              datas: {
                create: "jsonb NULL",
                columnAlias() {
                  return undefined;
                },
                type: "json",
              },
              database: {
                create: "text NULL",
                columnAlias() {
                  return undefined;
                },
                type: "text",
              },
              returnid: {
                create: "text NULL",
                columnAlias() {
                  return undefined;
                },
                type: "text",
              },
              error: {
                create: "jsonb NULL",
                columnAlias() {
                  return undefined;
                },
                type: "json",
              },
            },
            relations: {},
          },
        
          Users: {
            name: "Users",
            singular: "User",
            table: "user",
            createOrder: -1,
            order: 21,
            canPost: true,
            extensions: [EextensionsType.admin],
            orderBy: `"name"`,
            count: this.makeCount("user"),
            visible: false,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias() {
                  return undefined;
                },
                type: "bigint"
              },
              username: {
                create: "text NOT NULL UNIQUE",
                columnAlias() {
                  return undefined;
                },
                type: "string"
              },
              email: {
                create: "text NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "string"
              },
              password: {
                create: "text NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "string"
              },
              database: {
                create: "text NOT NULL",
                columnAlias() {
                  return undefined;
                },
                type: "string"
              },
              canPost: {
                create: "bool NULL",
                columnAlias() {
                  return undefined;
                },
                type: "boolean"
              },
              canDelete: {
                create: "bool NULL",
                columnAlias() {
                  return undefined;
                },
                type: "boolean"
              },
              canCreateUser: {
                create: "bool NULL",
                columnAlias() {
                  return undefined;
                },
                type: "boolean"
              },
              canCreateDb: {
                create: "bool NULL",
                columnAlias() {
                  return undefined;
                },
                type: "boolean"
              },
              admin: {
                create: "bool NULL",
                columnAlias() {
                  return undefined;
                },
                type: "boolean"
              },
              superAdmin: {
                create: "bool NULL",
                columnAlias() {
                  return undefined;
                },
                type: "boolean"
              },
            },
            relations: {},
          },
        
          Configs: {
            name: "Configs",
            singular: "Config",
            table: "",
            createOrder: -1,
            order: 20,
            extensions: [EextensionsType.logs, EextensionsType.admin],
            orderBy: `"name"`,
            count: "",
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
            createOrder: 0,
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
            createOrder: 0,
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
  }

  security(): Isecurity {
  return  {
    Users: {
      name: "Users",
      singular: "User",
      table: "user",
      createOrder: 1,
      order: 0,
      extensions: [EextensionsType.security],
      orderBy: `"id"`,
      count: this.makeCount("user"),
      visible: true,
      columns: {
        id: {
          create: "BIGINT GENERATED ALWAYS AS IDENTITY",
          columnAlias(config: IconfigFile, test: IKeyBoolean) {          
            return makeIDAlias(test["alias"] === true);
          },
          type: "number",
        },
        username: {
          create: "text NOT NULL",
          columnAlias() {
            return undefined;
          },
          type: "text",
        },
        userpass: {
          create: "text NOT NULL",
          columnAlias() {
            return undefined;
          },
          type: "text",
        }
      },
      constraints: {
        thing_pkey: 'PRIMARY KEY ("id")',
        thing_unik_name: 'UNIQUE ("username")',
      },
      canPost: false,
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
    },
    Roles: {
      name: "Roles",
      singular: "Role",
      table: "role",
      createOrder: 1,
      order: 10,
      extensions: [EextensionsType.security],
      orderBy: `"rolename"`,
      count: this.makeCount("role"),
      visible: true,
      columns: {
        rolename: {
          create: "text NOT NULL",
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
        properties: {
          create: "jsonb NULL",
          columnAlias() {
            return undefined;
          },
          type: "json",
        },
      },
      constraints: {
        thing_unik_name: 'UNIQUE ("rolename")',
      },
      canPost: false,
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
    },
    UsersRoles: {
      name: "UsersRoles",
      singular: "UsersRole",
      table: "user_role",
      createOrder: -1,
      order: -1,
      extensions: [EextensionsType.security],
      orderBy: `"user_id"`,
      count: this.makeCount("user_role"),
      visible: false,
      columns: {
        user_id: {
          create: "BIGINT NOT NULL",
          columnAlias() {
            return undefined;
          },
          type: "bigint"
        },
        role_id: {
          create: "BIGINT NOT NULL",
          columnAlias() {
            return undefined;
          },
          type: "bigint"
        },
      },
      canPost: false,
      relations: {},
      constraints: {
        user_role_pkey: 'PRIMARY KEY ("user_id", "role_id")',
        user_role_user_id_fkey:
          'FOREIGN KEY ("user_id") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE CASCADE',
          user_role_role_id_fkey:
          'FOREIGN KEY ("role_id") REFERENCES "role"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      },
      indexes: {
        user_role_user_id:
          'ON public."user_role" USING btree ("user_id")',
          user_role_role_id:
          'ON public."user_role" USING btree ("role_id")',
      },
    },
    UserProjectRoles: {
      name: "UserProjectRoles",
      singular: "UserProjectRole",
      table: "userprojectroles",
      createOrder: 1,
      order: 10,
      extensions: [EextensionsType.security],
      orderBy: `"rolename"`,
      count: this.makeCount("role"),
      visible: true,
      columns: {
        rolename: {
          create: "text NOT NULL",
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
        properties: {
          create: "jsonb NULL",
          columnAlias() {
            return undefined;
          },
          type: "json",
        },
      },
      constraints: {
        thing_unik_name: 'UNIQUE ("rolename")',
      },
      canPost: false,
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
    },
    Projects: {
      name: "Users",
      singular: "User",
      table: "user",
      createOrder: 1,
      order: 0,
      extensions: [EextensionsType.security],
      orderBy: `"id"`,
      count: this.makeCount("user"),
      visible: true,
      columns: {
        id: {
          create: "BIGINT GENERATED ALWAYS AS IDENTITY",
          columnAlias(config: IconfigFile, test: IKeyBoolean) {
            return makeIDAlias(test["alias"] === true);
          },
          type: "number",
        },
        username: {
          create: "text NOT NULL",
          columnAlias() {
            return undefined;
          },
          type: "text",
        },
        userpass: {
          create: "text NOT NULL",
          columnAlias() {
            return undefined;
          },
          type: "text",
        }
      },
      constraints: {
        thing_pkey: 'PRIMARY KEY ("id")',
        thing_unik_name: 'UNIQUE ("username")',
      },
      canPost: false,
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
    }


  }
}

  escape(input: string, ignore?: string) {
    let pattern = "";
    const map = {
        '>': '&gt;'
      , '<': '&lt;'
      , "'": '&apos;'
      , '"': '&quot;'
      , '&': '&amp;'
    };
  
    if (input === null || input === undefined) return;
  
    ignore = (ignore || '').replace(/[^&"<>\']/g, '');
    pattern = '([&"<>\'])'.replace(new RegExp('[' + ignore + ']', 'g'), '');
  
    return input.replace(new RegExp(pattern, 'g'), function(str, item) {
              return map[item];
            });
  }

  getDraw(ctx: koa.Context) {
    const deleteId = (id: string) => {
      const start = `<mxCell id="${id}"`;
      const end = "</mxCell>";
      fileContent = fileContent.replace(`${start}${fileContent.split(start)[1].split(end)[0]}${end}`, "");      
    };
    const entities = Models.models[ctx.config.apiVersion];
    let fileContent = fs.readFileSync(__dirname + `/model.drawio`, "utf8");
    fileContent = fileContent.replace('&gt;Version&lt;', `&gt;version : ${ctx.config.apiVersion}&lt;`);
    if(!ctx.config.extensions.includes(EextensionsType.logs)) deleteId("124");
    if(!ctx.config.extensions.includes(EextensionsType.multiDatastream)) {
      ["114" ,"115" ,"117" ,"118" ,"119" ,"116" ,"120" ,"121"].forEach(e => deleteId(e));
      fileContent = fileContent.replace(`&lt;hr&gt;COLUMNS.${entities.MultiDatastreams.name}`, "");
      fileContent = fileContent.replace(`&lt;hr&gt;COLUMNS.${entities.MultiDatastreams.name}`, "");
      fileContent = fileContent.replace(`&lt;strong&gt;${entities.MultiDatastreams.singular}&lt;/strong&gt;`, "");
    }
    Object.keys(entities).forEach((strEntity: string) => {
      fileContent = fileContent.replace(`COLUMNS.${entities[strEntity].name}`, this.getColumnListNameWithoutId(entities[strEntity]).map((colName: string) => `&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;${colName}: ${entities[strEntity].columns[colName].type.toUpperCase()}&lt;/p&gt;`).join(""));
    });

    return fileContent;
  }
  
  getInfos(ctx: koa.Context) {
    const temp = serverConfig.getLinkBase(ctx, ctx.config.name)
    const result = {
      ... temp,
      ready : ctx.config.connection ? true : false,
    };
    const extensions = {};
    switch (ctx.config.apiVersion) {
      case EmodelType.v1_1:
        result["Ogc link"] = "https://docs.ogc.org/is/18-088/18-088.html";
        break;
        
        default:
        result["Ogc link"] = "https://docs.ogc.org/is/15-078r6/15-078r6.html";
        break;
    }
    if (ctx.config.extensions.includes(EextensionsType.tasking)) extensions["tasking"] = "https://docs.ogc.org/is/17-079r1/17-079r1.html";
    if (ctx.config.extensions.includes(EextensionsType.logs)) extensions["logs"] = `${ctx.decodedUrl.linkbase}/${ctx.config.apiVersion}/Logs`;
      
    result["extensions"] = extensions;
    return result;
  }

  private makeCount(table: string) {
    return `SELECT count(DISTINCT id) from "${table}" AS count`;
  }

    // Get multiDatastream or Datastrems infos in one function
  public async getStreamInfos(config: IconfigFile, input: JSON ): Promise<IstreamInfos | undefined> {
    const stream: _STREAM = input["Datastream"] ? "Datastream" : input["MultiDatastream"] ? "MultiDatastream" : undefined;
    if (!stream) return undefined;
    const streamEntity = models.getEntityName(config, stream); 
    if (!streamEntity) return undefined;
    const foiId: bigint | undefined = input["FeaturesOfInterest"] ? input["FeaturesOfInterest"] : undefined;
    const searchKey = input[models.DBFull(config)[streamEntity].name] || input[models.DBFull(config)[streamEntity].singular];
    const streamId: string | undefined = isNaN(searchKey) ? searchKey["@iot.id"] : searchKey;
    if (streamId) {
      const query = `SELECT "id", "observationType", "_default_foi" FROM ${addDoubleQuotes(models.DBFull(config)[streamEntity].table)} WHERE id = ${BigInt(streamId)} LIMIT 1`;
      return executeSqlValues(config, queryAsJson({ query: query, singular: true, count: false }))
        .then((res: object) => {        
          return res ? {
            type: stream,
            id: res[0]["id"],
            observationType: res[0]["observationType"],
            FoId: foiId ? foiId : res[0]["_default_foi"],
          } : undefined;
        })
        .catch((error) => {
          log.errorMsg(error);
          return undefined;
        });
    }
  }

  private version1_1(input: Ientities): Ientities {
    const makeJson = (name:string) => {
      return {
        create : "jsonb NULL",
        columnAlias() {
          return `"${name}"`;
        },
        type: "json"
      };
    };

    ["Things", "Locations", "FeaturesOfInterest", "ObservedProperties", "Sensors", "Datastreams", "MultiDatastreams"]
      .forEach((e: string) => { input[e].columns["properties"] = makeJson("properties"); });
  
    input.Locations.columns["geom"] = {
      create: "geometry NULL",
      columnAlias() {
        return `"geom"`;
      },
      type: "json",
    };
    return input;
  }
  
  public isVersionExist(nb: string): boolean{
    if (testVersion(nb) === true) return true;
    if (this.createVersion(nb) === true ) return true;
    throw new Error(msg(errors.wrongVersion, nb));      
  }

  public createVersion(nb: string): boolean{
    switch (nb) {
      case "1.1":          
      case "v1.1":          
      case EmodelType.v1_1:          
        Models.models[EmodelType.v1_1] = this.version1_1(deepClone(Models.models[EmodelType.v1_0]));
    } 
    return testVersion(nb);
  }

  private filtering(config: IconfigFile, filterVisible?: boolean) { 
    const entities = 
    filterVisible
      ? Object.keys(Models.models[config.apiVersion]).filter((e) => [ EextensionsType.base,  EextensionsType.logs, ... config.extensions, ].some((r) => Models.models[config.apiVersion][e].extensions.includes(r) && Models.models[config.apiVersion][e].visible === true))
      : Object.keys(Models.models[config.apiVersion]).filter((e) => [ EextensionsType.base,  EextensionsType.logs, ... config.extensions, ].some((r) => Models.models[config.apiVersion][e].extensions.includes(r)));
    return Object.fromEntries(Object.entries(Models.models[config.apiVersion]).filter( ([k]) => entities.includes(k))) as Ientities;
  }

  public version(config: IconfigFile): string {
    if (config && config.apiVersion && testVersion(config.apiVersion)) return config.apiVersion;
    throw new Error(msg(errors.wrongVersion, config.apiVersion));
  }

  public filteredModelForQuery(config: IconfigFile, ): Ientities {
    if (testVersion(config.apiVersion) === false) this.createVersion(config.apiVersion);
    return config.name === "admin" ? this.DBAdmin(config) : this.filtering(config, true);
  }

  public filteredModelFromConfig(config: IconfigFile, ): Ientities {
    if (testVersion(config.apiVersion) === false) this.createVersion(config.apiVersion);
    return config.name === "admin" ? this.DBAdmin(config) : this.filtering(config);
  }
  
  public DBFull(config: IconfigFile | string): Ientities {
    if (typeof config === "string") {
      const nameConfig = serverConfig.getConfigNameFromName(config);
      if(!nameConfig) throw new Error(errors.configName);
      if (testVersion(serverConfig.getConfig(nameConfig).apiVersion) === false) this.createVersion(serverConfig.getConfig(nameConfig).apiVersion);
      config = serverConfig.getConfig(nameConfig);
    }  
    return Models.models[config.apiVersion];
  }
  
  public DBAdmin(config: IconfigFile):Ientities {
    const entities = Models.models[EmodelType.v1_0];
    return Object.fromEntries(Object.entries(entities).filter(([, v]) => v.extensions.includes(EextensionsType.admin))) as Ientities;
  } 

  public isSingular(config: IconfigFile, input: string): boolean { 
    if(config && input) {
      const entityName = this.getEntityName(config, input); 
      return entityName ? Models.models[config.apiVersion][entityName].singular == input : false; 
    }          
    return false;
  }

  public getEntityName(config: IconfigFile, search: string): string | undefined {
    if(config && search) {        
      const tempModel = Models.models[config.apiVersion];
      const testString: string | undefined = search
          .trim()
          .match(/[a-zA-Z_]/g)
          ?.join("");

      return tempModel && testString
          ? tempModel.hasOwnProperty(testString)
          ? testString
          : Object.keys(tempModel).filter(
              (elem: string) =>
              tempModel[elem].table == testString.toLowerCase() ||
              tempModel[elem].singular == testString
              )[0]
          : undefined;
    }
  }

  public getEntity = (config: IconfigFile, entity: Ientity | string): Ientity | undefined => {
    if (config && entity) {
      if (typeof entity === "string") {
        const entityName = this.getEntityName(config, entity.trim());
        if (!entityName) return;
        entity = entityName;
      } 
      return (typeof entity === "string") ? Models.models[config.apiVersion][entity] : Models.models[config.apiVersion][entity.name];
    }
  };
  
  public getRelationColumnTable = (config: IconfigFile, entity: Ientity | string, test: string): EcolType | undefined => {
    if (config && entity) {
      const tempEntity = this.getEntity(config, entity);
      if (tempEntity)
          return tempEntity.relations.hasOwnProperty(test)
          ? EcolType.Relation
          : tempEntity.columns.hasOwnProperty(test)
              ? EcolType.Column
              : undefined;
    }      
  };

  public getSelectColumnList(input: Ientity) {
      return Object.keys(input.columns).filter((word) => !word.includes("_")).map((e: string) => `${addDoubleQuotes(input.table)}.${addDoubleQuotes(e)}`);
  }

  getColumnListNameWithoutId(input: Ientity) {
    return Object.keys(input.columns).filter((word) => !word.includes("_") && !word.includes("id")); 
  }

  public isColumnType(config: IconfigFile, entity: Ientity | string, column: string , test: string): boolean {
    if (config && entity) {
      const tempEntity = this.getEntity(config, entity);
      return tempEntity && tempEntity.columns[column] ? (tempEntity.columns[column].type.toLowerCase() === test.toLowerCase()) : false;
    }
    return false;
  }

  public getRoot(ctx: koa.Context) {
    console.log(formatLog.whereIam());
    let expectedResponse: object[] = [];
    Object.keys(ctx.model)
    .filter((elem: string) => ctx.model[elem].order > 0)
    .sort((a, b) => (ctx.model[a].order > ctx.model[b].order ? 1 : -1))
    .forEach((value: string) => {
        expectedResponse.push({
          name: ctx.model[value].name,
          url: `${ctx.decodedUrl.linkbase}/${ctx.config.apiVersion}/${value}`,
        });
      });
    
    switch (ctx.config.apiVersion) {
      case EmodelType.v1_0:
        return {
          value : expectedResponse.filter((elem) => Object.keys(elem).length)
        };    
      case EmodelType.v1_1:
        expectedResponse = expectedResponse.filter((elem) => Object.keys(elem).length);    
        const list:string[] = [];
        list.push(conformance["1.1"].root);
        list.push("https://docs.ogc.org/is/18-088/18-088.html#uri-components");
        list.push("https://docs.ogc.org/is/18-088/18-088.html#resource-path");
        list.push("https://docs.ogc.org/is/18-088/18-088.html#requesting-data");
        list.push("https://docs.ogc.org/is/18-088/18-088.html#create-update-delete");
        // conformance.push("https://docs.ogc.org/is/18-088/18-088.html#batch-requests");
        if(ctx.config.extensions.includes(EextensionsType.multiDatastream)) list.push("https://docs.ogc.org/is/18-088/18-088.html#multidatastream-extension");
        if(ctx.config.extensions.includes(EextensionsType.mqtt)) list.push("https://docs.ogc.org/is/18-088/18-088.html#create-observation-dataarray");
        // conformance.push("https://docs.ogc.org/is/18-088/18-088.html#mqtt-extension");
        list.push("http://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html");
        list.push("https://datatracker.ietf.org/doc/html/rfc4180");
        return {
          value : expectedResponse.filter((elem) => Object.keys(elem).length),
          serverSettings : {"conformance" : list}
        };  
        
        default:
          break;
      }
  }

  public init() {
    if (isTest()) {      
      this.createVersion(serverConfig.getConfig(TEST).apiVersion);
    }
  }
}

export const models = new Models();
