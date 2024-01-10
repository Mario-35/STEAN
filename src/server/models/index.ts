import { serverConfig } from "../configuration";
import { DEFAULT_API_VERSION, ESCAPE_ARRAY_JSON, ESCAPE_SIMPLE_QUOTE, TEST, versionString } from "../constants";
import { log } from "../log";
import { _STREAM } from "../db/constants";
import { executeSqlValues } from "../db/helpers";
import { queryAsJson } from "../db/queries";
import { EcolType, EdatesType, EextensionsType, EobservationType, Erelations } from "../enums";
import { addDoubleQuotes, addSimpleQuotes, deepClone, isObject, isTest } from "../helpers";
import { formatLog } from "../logger";
import { errors, msg } from "../messages";
import { IconfigFile, Ientities, Ientity, IKeyBoolean, IstreamInfos } from "../types";
import koa from "koa";

const testVersion = (input: string) => Object.keys(Models.models).includes(input);

class Models {
  static models : { [key: string]: Ientities; } = {};
  static makeIDAlias = '"id" AS "@iot.id"';
  // Create Object FOR DEFAULT_API_VERSION
  constructor() { 
      Models.models[DEFAULT_API_VERSION] = {
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
                columnAlias() {
                  return Models.makeIDAlias;
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
            createOrder: 2,
            order: 4,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("featureofinterest"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias() {
                  return Models.makeIDAlias;
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
              }
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
            createOrder: 3,
            order: 6,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("location"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias() {
                  return Models.makeIDAlias;
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
            createOrder: -1,
            order: 5,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("historical_location"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias() {
                  return Models.makeIDAlias;
                },
                type: "bigint"
              },
              time: {
                create: "timestamptz NULL",
                columnAlias() {
                  return `"time"`;
                },
                type: "date"
              },
              thing_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return `"thing_id"`;
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
                  return `"location_id"`;
                },
                type: "bigint"
              },
              historical_location_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return `"historical_location_id"`;
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
            createOrder: 4,
            order: 8,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("observedproperty"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias() {
                  return Models.makeIDAlias;
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
            createOrder: 5,
            order: 9,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("sensor"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias() {
                  return Models.makeIDAlias;
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
                create: "text NOT NULL DEFAULT 'application/pdf'::text",
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
                create: "text NOT NULL DEFAULT 'none.pdf'::text",
                columnAlias() {
                  return `"metadata"`;
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
            createOrder: 7,
            order: 1,
            extensions: [EextensionsType.base],
            orderBy: `"id"`,
            count: this.makeCount("datastream"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias() {
                  return Models.makeIDAlias;
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
            createOrder: 8,
            order: 2,
            extensions: [EextensionsType.multiDatastream],
            orderBy: `"id"`,
            count: this.makeCount("multidatastream"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias() {
                  return Models.makeIDAlias;
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
                type: "text[]",
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
              _default_foi: {
                create: "BIGINT NOT NULL DEFAULT 1",
                columnAlias() {
                  return `"_default_foi"`;
                },
                type: "bigint"
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
            createOrder: -1,
            order: -1,
            extensions: [EextensionsType.multiDatastream],
            orderBy: `"multidatastream_id"`,
            count: this.makeCount("multi_datastream_observedproperty"),
            visible: true,
            columns: {
              multidatastream_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return `"multidatastream_id"`;
                },
                type: "bigint"
              },
              observedproperty_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return `"observedproperty_id"`;
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
            createOrder: 11,
            order: 7,
            extensions: [EextensionsType.base],
            orderBy: `"phenomenonTime"`,
            count: this.makeCount("observation"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias() {
                  return Models.makeIDAlias;
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
                columnAlias(config: IconfigFile, test: IKeyBoolean | undefined) {
                  return test
                    ? test["valuesKeys"] 
                      ? `coalesce("result"-> 'valueskeys', "result"-> 'value')${test && test["as"] === true ? ` AS "result"`: ''}`
                      : test["numeric"] && test["numeric"] === true
                      ? `CASE WHEN jsonb_typeof("result"-> 'value') = 'number' THEN ("result"->>'value')::numeric END${test && test["as"] === true ? ` AS "result"`: ''}`
                      : `"result"->'value'${test && test["as"] === true ? ` AS "result"`: ''}`
                    : "result";
        
        
                },
                type: "result",
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

              payload: {
                create: "",
                columnAlias(config: IconfigFile, test: IKeyBoolean | undefined) {
                  return config.extensions.includes("lora")
                  ? `CASE WHEN result->'payload' notnull THEN result->>'payload' WHEN result->'valueskeys' notnull THEN result->>'valueskeys' WHEN result->'value' notnull THEN result->>'value' END AS payload` 
                  : ""; },
                type: "string",
              },
              deveui: {
                create: "",
                columnAlias(config: IconfigFile, test: IKeyBoolean | undefined) {
                  return config.extensions.includes("lora")
                  ? `CASE WHEN multidatastream_id notnull  THEN (select deveui from lora where multidatastream_id = observation.multidatastream_id) WHEN datastream_id notnull  THEN (select deveui from lora where datastream_id = observation.datastream_id) END AS deveui`
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
                columnAlias() {
                  return Models.makeIDAlias;
                },
                type: "bigint"
              },
              validTime: {
                create: "timestamptz DEFAULT CURRENT_TIMESTAMP",
                columnAlias() {
                  return `"validTime"`;
                },
                type: "date"
              },
              _result: {
                create: "jsonb NULL",
                columnAlias() {
                  return `"_result"`;
                },
                type: "json"
              },
              observation_id: {
                create: "BIGINT NULL",
                columnAlias() {
                  return `"observation_id"`;
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
            createOrder: -1,
            order: -1,
            extensions: [EextensionsType.base],
            orderBy: `"thing_id"`,
            count: this.makeCount("thing_location"),
            visible: false,
            columns: {
              thing_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return `"thing_id"`;
                },
                type: "bigint"
              },
              location_id: {
                create: "BIGINT NOT NULL",
                columnAlias() {
                  return `"location_id"`;
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
            createOrder: 9,
            order: 12,
            extensions: [EextensionsType.lora],
            orderBy: `"id"`,
            count: this.makeCount("decoder"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias() {
                  return Models.makeIDAlias;
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
            createOrder: 10,
            order: 11,
            extensions: [EextensionsType.lora],
            orderBy: `"id"`,
            count: this.makeCount("lora"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias() {
                  return Models.makeIDAlias;
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
            extensions: [EextensionsType.logger],
            orderBy: `"date DESC"`,
            count: this.makeCount("logs"),
            visible: true,
            columns: {
              id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                columnAlias() {
                  return Models.makeIDAlias;
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
                create: "jsonb NULL",
                columnAlias() {
                  return `"error"`;
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
                  return `"id"`;
                },
                type: "bigint"
              },
              username: {
                create: "text NOT NULL UNIQUE",
                columnAlias() {
                  return `"username"`;
                },
                type: "string"
              },
              email: {
                create: "text NOT NULL",
                columnAlias() {
                  return `"email"`;
                },
                type: "string"
              },
              password: {
                create: "text NOT NULL",
                columnAlias() {
                  return `"password"`;
                },
                type: "string"
              },
              database: {
                create: "text NOT NULL",
                columnAlias() {
                  return `"database"`;
                },
                type: "string"
              },
              canPost: {
                create: "bool NULL",
                columnAlias() {
                  return `"canPost"`;
                },
                type: "boolean"
              },
              canDelete: {
                create: "bool NULL",
                columnAlias() {
                  return `"canDelete"`;
                },
                type: "boolean"
              },
              canCreateUser: {
                create: "bool NULL",
                columnAlias() {
                  return `"canCreateUser"`;
                },
                type: "boolean"
              },
              canCreateDb: {
                create: "bool NULL",
                columnAlias() {
                  return `"canCreateDb"`;
                },
                type: "boolean"
              },
              admin: {
                create: "bool NULL",
                columnAlias() {
                  return `"admin"`;
                },
                type: "boolean"
              },
              superAdmin: {
                create: "bool NULL",
                columnAlias() {
                  return `"superAdmin"`;
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
            order: -1,
            extensions: [EextensionsType.logger, EextensionsType.admin],
            orderBy: `"name"`,
            count: this.makeCount("config"),
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
  

  getColsName(entity: Ientity) {
    return Object.keys(entity.columns).filter((word) => !word.includes("_")); 
  }
  getDraw(ctx: koa.Context) {
    const entities = Models.models[DEFAULT_API_VERSION];
    const height = (entity: Ientity) => (this.getColsName(entity).length * 13) + 30;
    const cols = (entity: Ientity) => {
    let result = "";
    this.getColsName(entity).forEach((e: string) => {
        result += ` &lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;${e}: ${entity.columns[e].type}&lt;/p&gt;`;        
      });
      return result;
    };


const pipo = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2024-01-10T14:36:45.127Z" agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0" etag="rRmkVoKY0RBCMMchtuG4" version="22.1.18" type="github">
  <diagram name="Page-1" id="efa7a0a1-bf9b-a30e-e6df-94a7791c09e9">
    <mxGraphModel dx="1934" dy="1057" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="826" pageHeight="1169" background="none" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="BFmJljl-8hoy7SMpkLxM-120" value="" style="group" parent="1" vertex="1" connectable="0">
          <mxGeometry width="810" height="620" as="geometry" />
        </mxCell>
        <mxCell id="22" value="&lt;p style=&quot;margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;&quot;&gt;&lt;strong&gt;Observation&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;${cols(entities.Observations)}" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="BFmJljl-8hoy7SMpkLxM-120" vertex="1">
          <mxGeometry x="576.3949843260187" y="152.45901639344265" width="233.60501567398117" height="133.4016393442623" as="geometry" />
        </mxCell>
        <mxCell id="23" value="&lt;p style=&quot;margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;&quot;&gt;&lt;strong&gt;ObservedProperty&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;${cols(entities.ObservedProperties)}" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="BFmJljl-8hoy7SMpkLxM-120" vertex="1">
          <mxGeometry x="248.29166144200622" width="162.5078369905956" height="79.64459016393442" as="geometry" />
        </mxCell>
        <mxCell id="24" value="&lt;p style=&quot;margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;&quot;&gt;&lt;strong&gt;Sensor&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;${cols(entities.Sensors)}" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="BFmJljl-8hoy7SMpkLxM-120" vertex="1">
          <mxGeometry y="5.777527818639503e-14" width="162.5078369905956" height="114.89311475409836" as="geometry" />
        </mxCell>
        <mxCell id="27" value="&lt;p style=&quot;margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;&quot;&gt;&lt;strong&gt;FeatureOfInterest&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;${cols(entities.FeaturesOfInterest)}" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="BFmJljl-8hoy7SMpkLxM-120" vertex="1">
          <mxGeometry x="584.012539184953" y="407.827868852459" width="218.36990595611286" height="97.82786885245902" as="geometry" />
        </mxCell>
        <mxCell id="28" value="&lt;p style=&quot;margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;&quot;&gt;&lt;strong&gt;Location&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;${cols(entities.Locations)}" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="BFmJljl-8hoy7SMpkLxM-120" vertex="1">
          <mxGeometry x="10.156739811912225" y="487.8688524590164" width="162.5078369905956" height="132.13114754098362" as="geometry" />
        </mxCell>
        <mxCell id="29" value="&lt;p style=&quot;margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;&quot;&gt;&lt;strong&gt;Datastream&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;${cols(entities.Datastreams)}" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="BFmJljl-8hoy7SMpkLxM-120" vertex="1">
          <mxGeometry x="213.2915360501568" y="152.45901639344265" width="232.50808777429467" height="150.46688524590164" as="geometry" />
        </mxCell>
        <mxCell id="BFmJljl-8hoy7SMpkLxM-112" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=1;entryY=0.75;entryDx=0;entryDy=0;exitX=0.563;exitY=0;exitDx=0;exitDy=0;exitPerimeter=0;endArrow=none;endFill=0;" parent="BFmJljl-8hoy7SMpkLxM-120" source="33" edge="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="355.48589341692787" y="428.15573770491807" as="sourcePoint" />
            <mxPoint x="172.66457680250784" y="365.9016393442623" as="targetPoint" />
            <Array as="points">
              <mxPoint x="355.48589341692787" y="365.9016393442623" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="33" value="&lt;p style=&quot;margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;&quot;&gt;&lt;strong&gt;HistoricalLocation&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;${height(entities.HistoricalLocations)}&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="BFmJljl-8hoy7SMpkLxM-120" vertex="1">
          <mxGeometry x="264.0752351097179" y="447.21311475409834" width="162.5078369905956" height="71.14754098360656" as="geometry" />
        </mxCell>
        <mxCell id="34" value="&lt;p style=&quot;margin: 0px ; margin-top: 4px ; text-align: center ; text-decoration: underline&quot;&gt;&lt;strong&gt;Thing&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;${cols(entities.Things)}" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="BFmJljl-8hoy7SMpkLxM-120" vertex="1">
          <mxGeometry x="10.156739811912225" y="316.3524590163934" width="162.5078369905956" height="91.47540983606558" as="geometry" />
        </mxCell>
        <mxCell id="51" value="" style="endArrow=none;endSize=12;startArrow=none;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;endFill=0;" parent="BFmJljl-8hoy7SMpkLxM-120" source="23" target="29" edge="1">
          <mxGeometry x="395.46282131661434" y="355.7377049180328" as="geometry">
            <mxPoint x="385.30608150470215" y="345.57377049180326" as="sourcePoint" />
            <mxPoint x="547.8139184952977" y="345.57377049180326" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="52" value="1" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="51" connectable="0" vertex="1">
          <mxGeometry x="-1" relative="1" as="geometry">
            <mxPoint x="-25" y="8" as="offset" />
          </mxGeometry>
        </mxCell>
        <mxCell id="53" value="0..*&#xa;" style="resizable=0;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="51" connectable="0" vertex="1">
          <mxGeometry x="1" relative="1" as="geometry">
            <mxPoint x="-16" y="-28" as="offset" />
          </mxGeometry>
        </mxCell>
        <mxCell id="66" value="" style="endArrow=none;endSize=12;startArrow=none;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;entryX=1;entryY=0.5;entryDx=0;entryDy=0;endFill=0;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" parent="BFmJljl-8hoy7SMpkLxM-120" source="33" target="28" edge="1">
          <mxGeometry x="476.71673981191213" y="534.7855737704921" as="geometry">
            <mxPoint x="466.5599999999999" y="524.6216393442626" as="sourcePoint" />
            <mxPoint x="985.2037617554859" y="772.4590163934427" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="67" value="0..*" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="66" connectable="0" vertex="1">
          <mxGeometry x="-1" relative="1" as="geometry">
            <mxPoint x="10" as="offset" />
          </mxGeometry>
        </mxCell>
        <mxCell id="68" value="1..*" style="resizable=0;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="66" connectable="0" vertex="1">
          <mxGeometry x="1" relative="1" as="geometry">
            <mxPoint x="30" y="5" as="offset" />
          </mxGeometry>
        </mxCell>
        <mxCell id="72" value="" style="endArrow=none;endSize=12;startArrow=none;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;entryX=0;entryY=0.75;rounded=0;endFill=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryDx=0;entryDy=0;" parent="BFmJljl-8hoy7SMpkLxM-120" source="34" target="29" edge="1">
          <mxGeometry x="425.933040752351" y="833.4426229508197" as="geometry">
            <mxPoint x="415.77630094043883" y="823.2786885245902" as="sourcePoint" />
            <mxPoint x="578.2841379310344" y="823.2786885245902" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="73" value="0..*&#xa;" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="72" connectable="0" vertex="1">
          <mxGeometry x="-1" relative="1" as="geometry">
            <mxPoint x="90" y="-71" as="offset" />
          </mxGeometry>
        </mxCell>
        <mxCell id="74" value="1" style="resizable=0;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="72" connectable="0" vertex="1">
          <mxGeometry x="1" relative="1" as="geometry">
            <mxPoint x="-130" y="22" as="offset" />
          </mxGeometry>
        </mxCell>
        <mxCell id="84" value="" style="endArrow=none;endSize=12;startArrow=none;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;endFill=0;" parent="BFmJljl-8hoy7SMpkLxM-120" source="27" target="22" edge="1">
          <mxGeometry x="1411.1368025078368" y="132.13114754098362" as="geometry">
            <mxPoint x="1400.9800626959245" y="121.9672131147541" as="sourcePoint" />
            <mxPoint x="1563.4878996865202" y="121.9672131147541" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="85" value="0..*" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="84" connectable="0" vertex="1">
          <mxGeometry x="-1" relative="1" as="geometry">
            <mxPoint x="-32" y="-121" as="offset" />
          </mxGeometry>
        </mxCell>
        <mxCell id="86" value="1" style="resizable=0;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="84" connectable="0" vertex="1">
          <mxGeometry x="1" relative="1" as="geometry">
            <mxPoint x="-12" y="89" as="offset" />
          </mxGeometry>
        </mxCell>
        <mxCell id="99" value="" style="endArrow=none;endSize=12;startArrow=none;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;endFill=0;exitX=0;exitY=0.25;exitDx=0;exitDy=0;" parent="BFmJljl-8hoy7SMpkLxM-120" source="29" target="24" edge="1">
          <mxGeometry x="375.1493416927899" y="365.9016393442623" as="geometry">
            <mxPoint x="364.9926018808777" y="355.7377049180328" as="sourcePoint" />
            <mxPoint x="527.5004388714732" y="355.7377049180328" as="targetPoint" />
            <Array as="points" />
          </mxGeometry>
        </mxCell>
        <mxCell id="100" value="0..*&#xa;" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="99" connectable="0" vertex="1">
          <mxGeometry x="-1" relative="1" as="geometry">
            <mxPoint x="-31.08000000000042" as="offset" />
          </mxGeometry>
        </mxCell>
        <mxCell id="101" value="1" style="resizable=0;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="99" connectable="0" vertex="1">
          <mxGeometry x="1" relative="1" as="geometry">
            <mxPoint x="-10" as="offset" />
          </mxGeometry>
        </mxCell>
        <mxCell id="107" value="" style="endArrow=none;edgeStyle=orthogonalEdgeStyle;" parent="BFmJljl-8hoy7SMpkLxM-120" source="28" target="34" edge="1">
          <mxGeometry x="192.97805642633227" y="965.5737704918033" as="geometry">
            <mxPoint x="182.82131661442006" y="955.4098360655738" as="sourcePoint" />
            <mxPoint x="345.3291536050157" y="955.4098360655738" as="targetPoint" />
          </mxGeometry>
        </mxCell>
        <mxCell id="108" value="0..*" style="resizable=0;align=left;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="107" connectable="0" vertex="1">
          <mxGeometry x="-1" relative="1" as="geometry">
            <mxPoint x="-30" y="-10" as="offset" />
          </mxGeometry>
        </mxCell>
        <mxCell id="109" value="0..*" style="resizable=0;align=right;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="107" connectable="0" vertex="1">
          <mxGeometry x="1" relative="1" as="geometry">
            <mxPoint x="-10" y="23.83999999999977" as="offset" />
          </mxGeometry>
        </mxCell>
        <mxCell id="BFmJljl-8hoy7SMpkLxM-113" value="1" style="resizable=0;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="BFmJljl-8hoy7SMpkLxM-120" connectable="0" vertex="1">
          <mxGeometry x="192.97805642633227" y="362.09016393442624" as="geometry" />
        </mxCell>
        <mxCell id="BFmJljl-8hoy7SMpkLxM-115" value="0..*" style="resizable=0;align=right;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="BFmJljl-8hoy7SMpkLxM-120" connectable="0" vertex="1">
          <mxGeometry x="385.95611285266455" y="435.14852459016396" as="geometry" />
        </mxCell>
        <mxCell id="BFmJljl-8hoy7SMpkLxM-117" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0.011;entryY=0.564;entryDx=0;entryDy=0;entryPerimeter=0;endArrow=none;endFill=0;" parent="BFmJljl-8hoy7SMpkLxM-120" source="29" target="22" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="BFmJljl-8hoy7SMpkLxM-118" value="0..n" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="BFmJljl-8hoy7SMpkLxM-120" connectable="0" vertex="1">
          <mxGeometry x="548.4639498432601" y="233.7704918032787" as="geometry" />
        </mxCell>
        <mxCell id="BFmJljl-8hoy7SMpkLxM-119" value="1" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="BFmJljl-8hoy7SMpkLxM-120" connectable="0" vertex="1">
          <mxGeometry x="457.05329153605015" y="233.7704918032787" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;


return pipo;
  //   const separateur = '<hr>';
  //   const line = (name: string, type: string) => `<p align="left" style="margin: 0px; margin-left: 8px;">${name}: ${type}</p>`;
  //   const box = (name: string) => `<mxCell id="BFmJljl-8hoy7SMpkLxM-154" value="${this.escape(`<p style="margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;"><strong>${name}</strong></p>${separateur}${line("adam", "mario")}" style="verticalAlign=top;namealign=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366`)}" parent="1" vertex="1">
  //   <mxGeometry y="-2220" width="230" height="131.25" as="geometry"/>
  //   </mxCell>`;

  //   const essai = (entity: Ientity)=> { return box(entity.name); };
  //   const moi = essai(Models.models[DEFAULT_API_VERSION].Observations);
  //   console.log(moi);
    
  //   const pipo = `<mxfile host="app.diagrams.net" modified="2024-01-10T10:06:35.703Z" agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0" etag="XfPi1KGYTIBx8QxI-6wc" version="22.1.18" type="github">
  //   <diagram name="Page-1" id="efa7a0a1-bf9b-a30e-e6df-94a7791c09e9">
  //     <mxGraphModel dx="2760" dy="3397" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="826" pageHeight="1169" background="none" math="0" shadow="0">
  //       <root>
  //         <mxCell id="0" />
  //         <mxCell id="1" parent="0" />
  //         ${moi}
  //       </root>
  //     </mxGraphModel>
  //   </diagram>
  // </mxfile>
  // `;
  // console.log(pipo);
  // return pipo;
  
  //   return `<mxfile host="app.diagrams.net" modified="2024-01-10T07:45:01.574Z" agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0" etag="Q-CgzNCfMCYfw80amKBz" version="22.1.17" type="github">
  //   <diagram name="Page-1" id="efa7a0a1-bf9b-a30e-e6df-94a7791c09e9">
  //     <mxGraphModel dx="1482" dy="3341" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="826" pageHeight="1169" background="none" math="0" shadow="0">
  //       <root>
  //         <mxCell id="0" />
  //         <mxCell id="1" parent="0" />
  //         <mxCell id="${idMain}" value="" style="group" vertex="1" connectable="0" parent="1">
  //           <mxGeometry y="-2170" width="797.5" height="610" as="geometry" />
  //         </mxCell>
  //         <mxCell id="22" value="${essai()}" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="${idMain}" vertex="1">
  //           <mxGeometry x="567.5" y="150.00000000000003" width="230" height="131.25" as="geometry" />
  //         </mxCell>
  //         <mxCell id="23" value="&lt;p style=&quot;margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;&quot;&gt;&lt;strong&gt;ObservedProperty&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;name:TEXT&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;definition: URI&lt;br&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;description:TEXT&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="${idMain}" vertex="1">
  //           <mxGeometry x="244.45999999999995" width="160" height="78.36" as="geometry" />
  //         </mxCell>
  //         <mxCell id="24" value="&lt;p style=&quot;margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;&quot;&gt;&lt;strong&gt;Sensor&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;name:TEXT&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;description: TEXT&lt;br&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;encodingType: valueCode&lt;br&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;metadata: any&lt;br&gt;&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="${idMain}" vertex="1">
  //           <mxGeometry y="5.684341886080802e-14" width="160" height="113.04" as="geometry" />
  //         </mxCell>
  //         <mxCell id="27" value="&lt;p style=&quot;margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;&quot;&gt;&lt;strong&gt;FeatureOfInterest&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;name:TEXT&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;description:TEXT&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;encodingType: valueCode&lt;br&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;feature: any&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="${idMain}" vertex="1">
  //           <mxGeometry x="575" y="401.25" width="215" height="96.25" as="geometry" />
  //         </mxCell>
  //         <mxCell id="28" value="&lt;p style=&quot;margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;&quot;&gt;&lt;strong&gt;Location&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;name:TEXT&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;description: TEXT&lt;br&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;encodingType: valueCode&lt;br&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;location: any&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="${idMain}" vertex="1">
  //           <mxGeometry x="10" y="480" width="160" height="130" as="geometry" />
  //         </mxCell>
  //         <mxCell id="29" value="&lt;p style=&quot;margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;&quot;&gt;&lt;strong&gt;Datastream&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;name:TEXT&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;description:TEXT&lt;/p&gt;: observationType: valueCode&lt;br&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;unitOfMeasurment: JSON&lt;br&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;observedArea: GM_Envelope[0..1]&lt;br&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;phenomenTime: TM_Period[0..1]&lt;br&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;resultTime TM_Period[0..1]&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="${idMain}" vertex="1">
  //           <mxGeometry x="210.00000000000006" y="150.00000000000003" width="228.92" height="148.04" as="geometry" />
  //         </mxCell>
  //         <mxCell id="BFmJljl-8hoy7SMpkLxM-112" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=1;entryY=0.75;entryDx=0;entryDy=0;exitX=0.563;exitY=0;exitDx=0;exitDy=0;exitPerimeter=0;endArrow=none;endFill=0;" edge="1" parent="${idMain}" source="33">
  //           <mxGeometry relative="1" as="geometry">
  //             <mxPoint x="350" y="421.25" as="sourcePoint" />
  //             <mxPoint x="170" y="360" as="targetPoint" />
  //             <Array as="points">
  //               <mxPoint x="350" y="360" />
  //             </Array>
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="33" value="&lt;p style=&quot;margin: 0px; margin-top: 4px; text-align: center; text-decoration: underline;&quot;&gt;&lt;strong&gt;HistoricalLocation&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;Itime: TM_Instant&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="${idMain}" vertex="1">
  //           <mxGeometry x="260" y="440" width="160" height="70" as="geometry" />
  //         </mxCell>
  //         <mxCell id="34" value="&lt;p style=&quot;margin: 0px ; margin-top: 4px ; text-align: center ; text-decoration: underline&quot;&gt;&lt;strong&gt;Thing&lt;/strong&gt;&lt;/p&gt;&lt;hr&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;name:TEXT&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;description: TEXT &lt;br&gt;&lt;/p&gt;&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;properties: JSON&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="${idMain}" vertex="1">
  //           <mxGeometry x="10" y="311.25" width="160" height="90" as="geometry" />
  //         </mxCell>
  //         <mxCell id="51" value="" style="endArrow=none;endSize=12;startArrow=none;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;endFill=0;" parent="${idMain}" source="23" target="29" edge="1">
  //           <mxGeometry x="389.35999999999996" y="350" as="geometry">
  //             <mxPoint x="379.35999999999996" y="340" as="sourcePoint" />
  //             <mxPoint x="539.3599999999999" y="340" as="targetPoint" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="52" value="1" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="51" connectable="0" vertex="1">
  //           <mxGeometry x="-1" relative="1" as="geometry">
  //             <mxPoint x="-25" y="8" as="offset" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="53" value="0..*&#xa;" style="resizable=0;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="51" connectable="0" vertex="1">
  //           <mxGeometry x="1" relative="1" as="geometry">
  //             <mxPoint x="-16" y="-28" as="offset" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="66" value="" style="endArrow=none;endSize=12;startArrow=none;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;entryX=1;entryY=0.5;entryDx=0;entryDy=0;endFill=0;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" parent="${idMain}" source="33" target="28" edge="1">
  //           <mxGeometry x="469.3599999999999" y="526.1600000000003" as="geometry">
  //             <mxPoint x="459.3599999999999" y="516.1600000000003" as="sourcePoint" />
  //             <mxPoint x="970" y="760" as="targetPoint" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="67" value="0..*" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="66" connectable="0" vertex="1">
  //           <mxGeometry x="-1" relative="1" as="geometry">
  //             <mxPoint x="10" as="offset" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="68" value="1..*" style="resizable=0;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="66" connectable="0" vertex="1">
  //           <mxGeometry x="1" relative="1" as="geometry">
  //             <mxPoint x="30" y="5" as="offset" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="72" value="" style="endArrow=none;endSize=12;startArrow=none;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;entryX=0;entryY=0.75;rounded=0;endFill=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryDx=0;entryDy=0;" parent="${idMain}" source="34" target="29" edge="1">
  //           <mxGeometry x="419.35999999999996" y="820" as="geometry">
  //             <mxPoint x="409.35999999999996" y="810" as="sourcePoint" />
  //             <mxPoint x="569.3599999999999" y="810" as="targetPoint" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="73" value="0..*&#xa;" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="72" connectable="0" vertex="1">
  //           <mxGeometry x="-1" relative="1" as="geometry">
  //             <mxPoint x="90" y="-71" as="offset" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="74" value="1" style="resizable=0;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="72" connectable="0" vertex="1">
  //           <mxGeometry x="1" relative="1" as="geometry">
  //             <mxPoint x="-130" y="22" as="offset" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="84" value="" style="endArrow=none;endSize=12;startArrow=none;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;endFill=0;" parent="${idMain}" source="27" target="22" edge="1">
  //           <mxGeometry x="1389.36" y="130" as="geometry">
  //             <mxPoint x="1379.36" y="120" as="sourcePoint" />
  //             <mxPoint x="1539.36" y="120" as="targetPoint" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="85" value="0..*" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="84" connectable="0" vertex="1">
  //           <mxGeometry x="-1" relative="1" as="geometry">
  //             <mxPoint x="-32" y="-121" as="offset" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="86" value="1" style="resizable=0;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="84" connectable="0" vertex="1">
  //           <mxGeometry x="1" relative="1" as="geometry">
  //             <mxPoint x="-12" y="89" as="offset" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="99" value="" style="endArrow=none;endSize=12;startArrow=none;startSize=14;startFill=0;edgeStyle=orthogonalEdgeStyle;endFill=0;exitX=0;exitY=0.25;exitDx=0;exitDy=0;" parent="${idMain}" source="29" target="24" edge="1">
  //           <mxGeometry x="369.35999999999996" y="360" as="geometry">
  //             <mxPoint x="359.35999999999996" y="350" as="sourcePoint" />
  //             <mxPoint x="519.3599999999999" y="350" as="targetPoint" />
  //             <Array as="points" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="100" value="0..*&#xa;" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="99" connectable="0" vertex="1">
  //           <mxGeometry x="-1" relative="1" as="geometry">
  //             <mxPoint x="-31.08000000000042" as="offset" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="101" value="1" style="resizable=0;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="99" connectable="0" vertex="1">
  //           <mxGeometry x="1" relative="1" as="geometry">
  //             <mxPoint x="-10" as="offset" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="107" value="" style="endArrow=none;edgeStyle=orthogonalEdgeStyle;" parent="${idMain}" source="28" target="34" edge="1">
  //           <mxGeometry x="190" y="950" as="geometry">
  //             <mxPoint x="180" y="940" as="sourcePoint" />
  //             <mxPoint x="340" y="940" as="targetPoint" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="108" value="0..*" style="resizable=0;align=left;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="107" connectable="0" vertex="1">
  //           <mxGeometry x="-1" relative="1" as="geometry">
  //             <mxPoint x="-30" y="-10" as="offset" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="109" value="0..*" style="resizable=0;align=right;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" parent="107" connectable="0" vertex="1">
  //           <mxGeometry x="1" relative="1" as="geometry">
  //             <mxPoint x="-10" y="23.83999999999977" as="offset" />
  //           </mxGeometry>
  //         </mxCell>
  //         <mxCell id="BFmJljl-8hoy7SMpkLxM-113" value="1" style="resizable=0;align=right;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" connectable="0" vertex="1" parent="${idMain}">
  //           <mxGeometry x="190" y="356.25" as="geometry" />
  //         </mxCell>
  //         <mxCell id="BFmJljl-8hoy7SMpkLxM-115" value="0..*" style="resizable=0;align=right;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" connectable="0" vertex="1" parent="${idMain}">
  //           <mxGeometry x="380" y="428.13" as="geometry" />
  //         </mxCell>
  //         <mxCell id="BFmJljl-8hoy7SMpkLxM-117" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0.011;entryY=0.564;entryDx=0;entryDy=0;entryPerimeter=0;endArrow=none;endFill=0;" edge="1" parent="${idMain}" source="29" target="22">
  //           <mxGeometry relative="1" as="geometry" />
  //         </mxCell>
  //         <mxCell id="BFmJljl-8hoy7SMpkLxM-118" value="0..n" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" connectable="0" vertex="1" parent="${idMain}">
  //           <mxGeometry x="540" y="230" as="geometry" />
  //         </mxCell>
  //         <mxCell id="BFmJljl-8hoy7SMpkLxM-119" value="1" style="resizable=0;align=left;verticalAlign=top;labelBackgroundColor=#ffffff;fontSize=10;strokeColor=#003366;shadow=1;fillColor=#D4E1F5;fontColor=#003366" connectable="0" vertex="1" parent="${idMain}">
  //           <mxGeometry x="450" y="230" as="geometry" />
  //         </mxCell>
  //       </root>
  //     </mxGraphModel>
  //   </diagram>
  // </mxfile>
  
  // `;
  }
  
  getInfos(ctx: koa.Context) {
    const result = {
      version : versionString(ctx._config.apiVersion),
      ready : ctx._config.connection ? true : false,
      model : `https://github.com/Mario-35/STEAN/blob/main/assets/${ctx._config.apiVersion}/model.png?raw=true`
    };
    const extensions = {};
    switch (ctx._config.apiVersion) {
      case "1.1":
        result["Ogc link"] = "https://docs.ogc.org/is/18-088/18-088.html";
        break;
        
        default:
        result["Ogc link"] = "https://docs.ogc.org/is/15-078r6/15-078r6.html";
        break;
    }

    if (ctx._config.extensions.includes("tasking")) extensions["tasking"] = "https://docs.ogc.org/is/17-079r1/17-079r1.html";
    if (ctx._config.extensions.includes("logs")) extensions["logs"] = `${ctx._linkBase}/${versionString(ctx._config.apiVersion)}/Logs`;
      
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
        Models.models["1.1"] = this.version1_1(deepClone(Models.models[DEFAULT_API_VERSION]));
    } 
    return testVersion(nb);
  }

  private filtering(config: IconfigFile) {
    const entities = Object.keys(Models.models[config.apiVersion]).filter((e) => [ EextensionsType.base, EextensionsType.logger, ... config.extensions, ].some((r) => Models.models[config.apiVersion][e].extensions.includes(r)));
    return Object.fromEntries(Object.entries(Models.models[config.apiVersion]).filter( ([k]) => entities.includes(k))) as Ientities;
  }

  public version(config: IconfigFile): string {
    if (config && config.apiVersion && testVersion(config.apiVersion)) return config.apiVersion;
    throw new Error(msg(errors.wrongVersion, config.apiVersion));
  }

  public filteredModelFromConfig(config: IconfigFile): Ientities {
    if (testVersion(config.apiVersion) === false) this.createVersion(config.apiVersion);

    return this.filtering(config);
  }
  
  public DBFull(config: IconfigFile | string): Ientities {
    if (typeof config === "string") {
      const nameConfig = serverConfig.getConfigNameFromName(config);
      if(!nameConfig) throw new Error(errors.configName);
      config = serverConfig.getConfig(nameConfig);
    }  
    return Models.models[config.apiVersion];
  }
  
  public DBAdmin(config: IconfigFile):Ientities {
    const entities = Models.models[config ? config.apiVersion : DEFAULT_API_VERSION];
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
    console.log(formatLog.head("getEntityName", search));
    if(config && search) {        
      const tempModel = Models.models[config.apiVersion];
      const testString: string | undefined = search
          .match(/[a-zA-Z_]/g)
          ?.join("")
          .trim();

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

  public isColumnType(config: IconfigFile, entity: Ientity | string, column: string , test: string): boolean {
    if (config && entity) {
      const tempEntity = this.getEntity(config, entity);
      return tempEntity && tempEntity.columns[column] ? (tempEntity.columns[column].type.toLowerCase() === test.toLowerCase()) : false;
    }
    return false;
  }

  public formatColumnValue(value: any, type: string): string | undefined {
    if (value) switch (value) {
      case void 0:
        return '';
      case null:
        return 'null';
        case value.isRawInstance:
          return value.toQuery();
      default:
        switch (type) {
          case 'number':
            return value;
          case 'bool':
            if (value === 'false') value = 0;
            return `'${value ? 1 : 0}'`;
          case 'json':
          case 'jsonb':
            if (isObject(value)) return addSimpleQuotes(ESCAPE_SIMPLE_QUOTE(JSON.stringify(value)));
            return "JSON ERROR";
          case 'text[]':
            const temp = ESCAPE_ARRAY_JSON(String(value));
            if (temp) return addSimpleQuotes(temp);
            return "ARRAY ERROR";
          default:
            break;
        }
        if (String(value).startsWith("(SELECT")) return `${value}`;
        try {
            return value.includes("'") ? addSimpleQuotes(ESCAPE_SIMPLE_QUOTE(value)): addSimpleQuotes(value);
        } catch (error) {            
            return addSimpleQuotes(value);
        }
    }
  }

  public createUpdateValues = (input : object ): string => { 
    const result:string[] = [];
    Object.keys(input).forEach((e: string) => {
          result.push(`${addDoubleQuotes(e)} = ${addSimpleQuotes(ESCAPE_SIMPLE_QUOTE(input[e]))}`);
      });
    return result.join();
  };

  public createInsertValues = (config: IconfigFile, input : object, entityName?: string): string => {
      if (config && input) {
          const keys:string[] = [];
          const values:string[] = [];            
          if (entityName) {
              const entity = this.getEntity(config, entityName);
              if (!entity) return "";
              Object.keys(input).forEach((e: string) => {                
                  if (input[e] && entity.columns[e]) {
                      const temp = this.formatColumnValue(input[e], entity.columns[e].type);
                      if (temp) {
                          keys.push(addDoubleQuotes(e));
                          values.push(temp);
                      }
                  }                
              });
          } else {
              Object.keys(input).forEach((e: string) => {
                  if (input[e]) {
                      keys.push(addDoubleQuotes(e));
                      values.push(typeof input[e] === "string" ? addSimpleQuotes(ESCAPE_SIMPLE_QUOTE(input[e])) : input[e] );
                  }
              });
          }
          return `(${keys.join()}) VALUES (${values.join()})`;  
      }
      return "";
  };

  public init() {
    if (isTest()) {      
      this.createVersion(serverConfig.getConfig(TEST).apiVersion);
    }
  }
}

export const models = new Models();
