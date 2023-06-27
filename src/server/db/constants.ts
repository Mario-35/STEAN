/**
 * Constants for DataBase.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

/* eslint-disable quotes */

import koa from "koa";
import { apiType, EdatesType, Eentities, EobservationType, Erelations } from "../enums";
import { Ientity } from "../types";
const makeIDAlias = (table: string) => `"${table}"."id" AS "@iot.id"`;
export const _RIGHTS = 'SUPERUSER CREATEDB NOCREATEROLE INHERIT LOGIN NOREPLICATION NOBYPASSRLS CONNECTION LIMIT -1';
export type _STREAM = "Datastream" | "MultiDatastream" | undefined;

const dbDatas: { [key in Eentities]: Ientity } = {
    Things: {
        name: "Things",
        singular: "Thing",
        table: "thing",
        order: 10,
        essai:[apiType.base],
        lora: false,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                alias: makeIDAlias("thing"),
                type : "number"                
            },
            name: {
                create: "text NOT NULL DEFAULT 'no name'::text",
                type : "text"
            },
            description: {
                create: "text NOT NULL",
                type : "text"
            },
            properties: {
                create: "jsonb NULL",
                type : "json"
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
                tableKey: "thing_id"
            },
            HistoricalLocations: {
                type: Erelations.hasMany,
                expand: `"historical_location"."id" in (select "historical_location"."id" from "historical_location" where "historical_location"."thing_id" = "thing"."id")`,
                link: `"historical_location"."id" in (select "historical_location"."id" from "historical_location" where "historical_location"."thing_id" = $ID)`,
                entityName: "HistoricalLocation",
                tableName: "historicalLocation",
                relationKey: "thing_id",
                entityColumn: "id",
                tableKey: "id"
            },
            Datastreams: {
                type: Erelations.hasMany,
                expand: `"datastream"."id" in (select "datastream"."id" from "datastream" where "datastream"."thing_id" = "thing"."id")`,
                link: `"datastream"."id" in (select "datastream"."id" from "datastream" where "datastream"."thing_id" = $ID)`,
                entityName: "Datastreams",
                tableName: "datastream",
                relationKey: "thing_id",
                entityColumn: "id",
                tableKey: "id"
            },
            MultiDatastreams: {
                type: Erelations.hasMany,
                expand: `"multidatastream"."id" in (select "multidatastream"."id" from "multidatastream" where "multidatastream"."thing_id" = "thing"."id")`,
                link: `"multidatastream"."id" in (select "multidatastream"."id" from "multidatastream" where "multidatastream"."thing_id" = $ID)`,
                entityName: "MultiDatastreams",
                tableName: "multidatastream",
                relationKey: "thing_id",
                entityColumn: "id",
                tableKey: "id"
            }
        }
    },

    FeaturesOfInterest: {
        name: "FeaturesOfInterest",
        singular: "FeatureOfInterest",
        table: "featureofinterest",
        order: 4,
        essai:[apiType.base],
        lora: false,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                alias: '"featureofinterest"."id" AS "@iot.id"',
                type : "number"

            },
            name: {
                create: "text NOT NULL DEFAULT 'no name'::text",
                type : "text"

            },
            description: {
                create: "text NOT NULL DEFAULT 'description'::text",
                type : "text"
            },
            encodingType: {
                create: "text NOT NULL",
                type : "text"
            },
            feature: {
                create: "jsonb NOT NULL",
                type : "json",
                test: "encodingType"
            },
            properties: {
                create: "jsonb NULL",
                type : "json"
            }
        },
        canPost: false,
        relations: {
            Observations: {
                type: Erelations.hasMany,
                expand: `"observation"."id" in (select "observation"."id" from "observation" where "observation"."featureofinterest_id" = "featureofinterest"."id")`,
                // link: `"observation"."id" = (select "observation"."id" from "observation" where "observation"."id" = $NESTED AND "observation"."featureofinterest_id" = $ID)`,
                link: `"observation"."id" in (select "observation"."id" from "observation" where "observation"."featureofinterest_id" = $ID)`,

                entityName: "Observations",
                tableName: "observation",
                relationKey: "featureofinterest_id",
                entityColumn: "id",
                tableKey: "id"
            }
        },
        constraints: {
            featureofinterest_pkey: 'PRIMARY KEY ("id")',
            featureofinterest_unik_name: 'UNIQUE ("name")',
        },
        after: "INSERT INTO featureofinterest (name, description, \"encodingType\", feature) VALUES ('Default Feature of Interest', 'Default Feature of Interest', 'application/vnd.geo+json', '{}');"
    },

    Locations: {
        name: "Locations",
        singular: "Location",
        table: "location",
        order: 6,
        essai:[apiType.base],
        lora: false,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                alias: makeIDAlias("location"),
                type : "number"
            },
            name: {
                create: "text NOT NULL DEFAULT 'no name'::text",
                type : "text"
            },
            description: {
                create: "text NOT NULL DEFAULT 'no description'::text",
                type : "text"
            },
            encodingType: {
                create: "text NOT NULL",
                dataList: {
                   "GeoJSON": "application/vnd.geo+json"
                },
                type : "list"
            },
            location: {
                create: "jsonb NOT NULL",
                type : "json",
                test: "encodingType"
            },
            geom: {
                // Not in Sensor 1.1
                create: "geometry NULL",
                type : "json"
            },
            properties: {
                // Not in Sensor 1.1
                create: "jsonb NULL",
                type : "json"
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
                tableKey: "thing_id"
            },
            HistoricalLocations: {
                type: Erelations.belongsToMany,
                expand: `"historical_location"."id" in (select "historical_location"."id" from "historical_location" where "historical_location"."thing_id" in (select "thing_location"."thing_id" from "thing_location" where "thing_location"."location_id" = "location"."id"))`,
                link: `"historical_location"."id" in (select "historical_location"."id" from "historical_location" where "historical_location"."thing_id" in (select "thing_location"."thing_id" from "thing_location" where "thing_location"."location_id" = $ID))`,

                entityName: "HistoricalLocation",
                tableName: "location_historical_location",
                relationKey: "location_id",
                // entityColumn: "location_id",
                entityColumn: "id",
                tableKey: "id"
            }
        }
    },

    HistoricalLocations: {
        name: "HistoricalLocations",
        singular: "HistoricalLocation",
        table: "historical_location",
        order: 5,
        essai:[apiType.base],
        lora: false,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                alias: makeIDAlias("historical_location")
            },
            time: {
                create: "timestamptz NULL"
            },
            thing_id: {
                create: "BIGINT NOT NULL"
            }
        },
        constraints: {
            historical_location_pkey: 'PRIMARY KEY ("id")',
            historical_location_thing_id_fkey: 'FOREIGN KEY ("thing_id") REFERENCES "thing"("id") ON UPDATE CASCADE ON DELETE CASCADE'
        },
        indexes: {
            historical_location_thing_id: 'ON public."historical_location" USING btree ("thing_id")'
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
                tableKey: "id"
            },
            Locations: {
                type: Erelations.belongsToMany,
                expand: `"location"."id" in (select "location"."id" from "location" where "location"."id" in (select "thing_location"."location_id" from "thing_location" where "thing_location"."thing_id" = "historical_location"."thing_id"))`,
                link: `"location"."id" in (select "location"."id" from "location" where "location"."id" in (select "thing_location"."location_id" from "thing_location" where "thing_location"."thing_id" in (select "historical_location"."thing_id" from "historical_location" where "historical_location"."id" = $ID)))`,

                entityName: "locationsHistoricalLocations",
                tableName: "location_historical_location",
                relationKey: "historical_location_id",
                entityColumn: "location_id",
                tableKey: "location_id"
            }
        }
    },

    locationsHistoricalLocations: {
        name: "locationsHistoricalLocations",
        singular: "locationHistoricalLocation",
        table: "location_historical_location",
        order: -1,
        essai:[apiType.base],
        lora: false,
        columns: {
            location_id: {
                create: "BIGINT NOT NULL"
            },
            historical_location_id: {
                create: "BIGINT NOT NULL"
            }
        },
        constraints: {
            location_historical_location_pkey: 'PRIMARY KEY ("location_id", "historical_location_id")',
            location_historical_location_historical_location_id_fkey:
                'FOREIGN KEY ("historical_location_id") REFERENCES "historical_location"("id") ON UPDATE CASCADE ON DELETE CASCADE',
            location_historical_location_location_id_fkey: 'FOREIGN KEY ("location_id") REFERENCES "location"("id") ON UPDATE CASCADE ON DELETE CASCADE'
        },
        indexes: {
            location_historical_location_historical_location_id: 'ON public."location_historical_location" USING btree ("historical_location_id")',
            location_historical_location_location_id: 'ON public."location_historical_location" USING btree ("location_id")'
        },
        canPost: false,
        relations: {}
    },

    ObservedProperties: {
        name: "ObservedProperties",
        singular: "ObservedProperty",
        table: "observedproperty",
        order: 8,
        essai:[apiType.base],
        lora: false,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                alias: makeIDAlias("observedproperty"),
                type : "number"
            },
            name: {
                create: "text NOT NULL DEFAULT 'no name'::text",
                type : "text"
            },
            definition: {
                create: "text NOT NULL DEFAULT 'definition'::text",
                type : "text"
            },
            description: {
                create: "text NOT NULL DEFAULT 'description'::text",
                type : "text"
            },
            properties: {
                // Not in Sensor 1.1
                create: "jsonb NULL",
                type : "json"
            }
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
                tableKey: "id"
            },
            MultiDatastreams: {
                type: Erelations.hasMany,
                expand: `"multidatastream"."id" in (SELECT "multi_datastream_observedproperty"."multidatastream_id" FROM "multi_datastream_observedproperty" WHERE "multi_datastream_observedproperty"."observedproperty_id" = "observedproperty"."id")`,
                link: `"multidatastream"."id" in (SELECT "multi_datastream_observedproperty"."multidatastream_id" FROM "multi_datastream_observedproperty" WHERE "multi_datastream_observedproperty"."observedproperty_id" = $ID)`,

                entityName: "MultiDatastreams",
                tableName: "multi_datastream_observedproperty",
                relationKey: "observedproperty_id",
                entityColumn: "multidatastream_id",
                tableKey: "multidatastream_id"
            }
        }
    },

    Sensors: {
        name: "Sensors",
        singular: "Sensor",
        table: "sensor",
        order: 9,
        essai:[apiType.base],
        lora: false,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                alias: makeIDAlias("sensor"),
                type : "number"
            },
            name: {
                create: "text NOT NULL DEFAULT 'no name'::text",
                type : "text"
            },
            description: {
                create: "text NOT NULL DEFAULT 'no description'::text",
                type : "text"
            },
            encodingType: {
                create: "text NOT NULL",
                dataList: {
                   "PDF": "application/pdf",
                   "SensorML": "http://www.opengis.net/doc/IS/SensorML/2.0"
                },
                type : "list"
            },
            metadata: {
                create: "text NOT NULL",
                type : "text"
            },
            properties: {
                // Not in Sensor 1.1
                create: "jsonb NULL",
                type : "json"
            }
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
                tableKey: "id"
            },
            MultiDatastreams: {
                type: Erelations.hasMany,
                expand: `"multidatastream"."id" in (select "multidatastream"."id" from "multidatastream" where "multidatastream"."id" = "sensor"."id")`,
                link: `"multidatastream"."id" in (select "multidatastream"."id" from "multidatastream" where "multidatastream"."sensor_id" = $ID)`,

                entityName: "MultiDatastreams",
                tableName: "multidatastream",
                relationKey: "sensor_id",
                entityColumn: "id",
                tableKey: "id"
            },
            Loras: {
                type: Erelations.belongsTo,
                expand: `"lora"."id" = (select "lora"."id" from "lora" where "lora"."sensor_id" = "sensor"."id")`,
                link: `"lora"."id" = (select "lora"."id" from "lora" where "lora"."sensor_id" = $ID)`,
                entityName: "Loras",
                tableName: "lora",
                relationKey: "sensor_id",
                entityColumn: "id",
                tableKey: "id"
            }
        }
    },

    Datastreams: {
        name: "Datastreams",
        singular: "Datastream",
        table: "datastream",
        order: 1,
        essai:[apiType.base],
        lora: false,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                alias: makeIDAlias("datastream"),
                type : "number"
            },
            name: {
                create: "text NOT NULL DEFAULT 'no name'::text",
                type : "text"
            },
            description: {
                create: "text NOT NULL DEFAULT 'no description'::text",
                type : "text"
            },
            observationType: {
                create: "text NOT NULL DEFAULT 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement'::text",
                type : "list",
                verify: {
                    list: Object.keys(EobservationType),
                    default: "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement"
                }
            },
            unitOfMeasurement: {
                create: "jsonb NOT NULL",
                type : "json"
            },
            observedArea: {
                create: "geometry NULL",
                   type : "json"
            },
            phenomenonTime: {
                create: "",
                alias: `CONCAT(\n\t\tto_char((SELECT min("observation"."phenomenonTime") from "observation" where "observation"."datastream_id" = "datastream"."id"),\n\t\t'${EdatesType.date}'),\n\t\t'/',\n\t\tto_char((SELECT max("observation"."phenomenonTime") from "observation" where "observation"."datastream_id" = "datastream"."id"),\n\t\t'${EdatesType.date}')\n\t) AS "phenomenonTime"`,
                type : "text"              
            },
            resultTime: {
                create: "",
                alias: `CONCAT(\n\t\tto_char((SELECT min("observation"."resultTime") from "observation" where "observation"."datastream_id" = "datastream"."id"),\n\t\t'${EdatesType.date}'),\n\t\t'/',\n\t\tto_char((SELECT max("observation"."resultTime") from "observation" where "observation"."datastream_id" = "datastream"."id"),\n\t\t'${EdatesType.date}')\n\t) AS "resultTime"`,
                type : "text"
            },
            thing_id: {
                create: "BIGINT NOT NULL",
                type : "relation:Things"
            },
            observedproperty_id: {
                create: "BIGINT NOT NULL",
                type : "relation:ObservedProperties"
            },
            sensor_id: {
                create: "BIGINT NOT NULL",
                type : "relation:Sensor"
            },
            properties: {
                create: "jsonb NULL",
                type : "json"
            },
            _default_foi: {
                create: "BIGINT NOT NULL DEFAULT 1",
            }
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
                tableKey: "id"
            },
            Sensor: {
                type: Erelations.belongsTo,
                expand: `"sensor"."id" = "datastream"."sensor_id"`,
                link: `"sensor"."id" = (select "datastream"."sensor_id" from "datastream" where "datastream"."id" =$ID)`,

                entityName: "Sensors",
                tableName: "datastream",
                relationKey: "id",
                entityColumn: "sensor_id",
                tableKey: "id"
            },
            ObservedProperty: {
                type: Erelations.belongsTo,
                expand: `"observedproperty"."id" = "datastream"."observedproperty_id"`,
                link: `"observedproperty"."id" = (select "datastream"."observedproperty_id" from "datastream" where "datastream"."id" =$ID)`,
                entityName: "ObservedProperties",
                tableName: "datastream",
                relationKey: "id",
                entityColumn: "observedproperty_id",
                tableKey: "id"
            },
            Observations: {
                type: Erelations.hasMany,
                expand: `"observation"."id" in (select "observation"."id" from "observation" where "observation"."datastream_id" = "datastream"."id" ORDER BY "observation"."resultTime" ASC)`,
                link: `"observation"."id" in (select "observation"."id" from "observation" where "observation"."datastream_id" = $ID ORDER BY "observation"."resultTime" ASC)`,
                entityName: "Observations",
                tableName: "observation",
                relationKey: "datastream_id",
                entityColumn: "id",
                tableKey: "id"
            },
            Loras: {
                type: Erelations.belongsTo,
                expand: `"lora"."id" = (select "lora"."id" from "lora" where "lora"."datastream_id" = "datastream"."id")`,
                link: `"lora"."id" = (select "lora"."id" from "lora" where "lora"."datastream_id" = $ID)`,
                entityName: "loras",
                tableName: "lora",
                relationKey: "datastream_id",
                entityColumn: "id",
                tableKey: "id"
            }
        },
        constraints: {
            datastream_pkey: 'PRIMARY KEY ("id")',
            datastream_unik_name: 'UNIQUE ("name")',
            datastream_observedproperty_id_fkey: 'FOREIGN KEY ("observedproperty_id") REFERENCES "observedproperty"("id") ON UPDATE CASCADE ON DELETE CASCADE',
            datastream_sensor_id_fkey: 'FOREIGN KEY ("sensor_id") REFERENCES "sensor"("id") ON UPDATE CASCADE ON DELETE CASCADE',
            datastream_thing_id_fkey: 'FOREIGN KEY ("thing_id") REFERENCES "thing"("id") ON UPDATE CASCADE ON DELETE CASCADE'
        },
        indexes: {
            datastream_observedproperty_id: 'ON public."datastream" USING btree ("observedproperty_id")',
            datastream_sensor_id: 'ON public."datastream" USING btree ("sensor_id")',
            datastream_thing_id: 'ON public."datastream" USING btree ("thing_id")'
        }
    },

    MultiDatastreams: {
        name: "MultiDatastreams",
        singular: "MultiDatastream",
        table: "multidatastream",
        order: 2,
        essai:[apiType.base],
        lora: false,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                alias: makeIDAlias("multidatastream"),
                type : "number"
            },
            name: {
                create: "text NOT NULL DEFAULT 'no name'::text",
                type : "text"
            },
            description: {
                create: "text NULL",
                type : "text"
            },
            unitOfMeasurements: {
                create: "jsonb NOT NULL",
                   type : "json"
            },
            observationType: {
                create: "text NOT NULL DEFAULT 'http://www.opengis.net/def/observation-type/ogc-om/2.0/om_complex-observation'::text",
                type : "list",
                verify: {
                    list: Object.keys(EobservationType),
                    default: "http://www.opengis.net/def/observation-type/ogc-om/2.0/om_complex-observation"
                }
            },
            multiObservationDataTypes: {
                create: "text[] NULL",
                type : "text"
            },
            observedArea: {
                create: "geometry NULL",
                   type : "json"
            },
            phenomenonTime: {
                create: "",
                alias: `CONCAT(to_char((SELECT min("observation"."phenomenonTime") from "observation" where "observation"."multidatastream_id" = "multidatastream"."id"),'${EdatesType.date}'),'/', to_char((SELECT max("observation"."phenomenonTime") from "observation" where "observation"."multidatastream_id" = "multidatastream"."id"),'${EdatesType.date}')) AS "phenomenonTime"`,
                type : "text"
            },
            resultTime: {
                create: "",
                alias: `CONCAT(to_char((SELECT min("observation"."resultTime") from "observation" where "observation"."multidatastream_id" = "multidatastream"."id"),'${EdatesType.date}'),'/', to_char((SELECT max("observation"."resultTime") from "observation" where "observation"."multidatastream_id" = "multidatastream"."id"),'${EdatesType.date}')) AS "resultTime"`,
                type : "text"
            },
            thing_id: {
                create: "BIGINT NOT NULL",
                type : "relation:Things"
            },
            sensor_id: {
                create: "BIGINT NOT NULL",
                type : "relation:Sensors"
            },
            properties: {
                create: "jsonb NULL",
                type : "json"
            },
            _default_foi: {
                create: "BIGINT NOT NULL DEFAULT 1",
            }
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
                tableKey: "id"
            },
            Sensor: {
                type: Erelations.belongsTo,
                expand: `"sensor"."id" = "multidatastream"."sensor_id"`,
                link: `"sensor"."id" = (select "multidatastream"."sensor_id" from "multidatastream" where "multidatastream"."id" =$ID)`,

                entityName: "Sensors",
                tableName: "multidatastream",
                relationKey: "id",
                entityColumn: "sensor_id",
                tableKey: "id"
            },
            Observations: {
                type: Erelations.hasMany,
                expand: `"observation"."id" in (select "observation"."id" from "observation" where "observation"."multidatastream_id" = "multidatastream"."id")`,
                link: `"observation"."id" in (select "observation"."id" from "observation" where "observation"."multidatastream_id" = $ID)`,

                entityName: "Observations",
                tableName: "observation",
                relationKey: "multidatastream_id",
                entityColumn: "id",
                tableKey: "id"
            },
            ObservedProperties: {
                type: Erelations.belongsTo,
                expand: `"observedproperty"."id" in (SELECT "multi_datastream_observedproperty"."observedproperty_id" FROM "multi_datastream_observedproperty" WHERE "multi_datastream_observedproperty"."multidatastream_id" = "multidatastream"."id")`,
                link: `"observedproperty"."id" in (SELECT "multi_datastream_observedproperty"."observedproperty_id" FROM "multi_datastream_observedproperty" WHERE "multi_datastream_observedproperty"."multidatastream_id" = $ID)`,
                entityName: "ObservedProperties",
                tableName: "multi_datastream_observedproperty",
                relationKey: "observedproperty_id",
                entityColumn: "multidatastream_id",
                tableKey: "multidatastream_id"
            },
            Loras: {
                type: Erelations.belongsTo,
                expand: `"lora"."id" = (select "lora"."id" from "lora" where "lora"."multidatastream_id" = "multidatastream"."id")`,
                link: `"lora"."id" = (select "lora"."id" from "lora" where "lora"."multidatastream_id" = $ID)`,
                entityName: "loras",
                tableName: "lora",
                relationKey: "multidatastream_id",
                entityColumn: "id",
                tableKey: "id"
            },
        },
        constraints: {
            multidatastream_pkey: 'PRIMARY KEY ("id")',
            multidatastream_unik_name: 'UNIQUE ("name")',
            multidatastream_sensor_id_fkey: 'FOREIGN KEY ("sensor_id") REFERENCES "sensor"("id") ON UPDATE CASCADE ON DELETE CASCADE',
            multidatastream_thing_id_fkey: 'FOREIGN KEY ("thing_id") REFERENCES "thing"("id") ON UPDATE CASCADE ON DELETE CASCADE'
        },
        indexes: {
            multidatastream_sensor_id: 'ON public."multidatastream" USING btree ("sensor_id")',
            multidatastream_thing_id: 'ON public."multidatastream" USING btree ("thing_id")'
        }
    },

    MultiDatastreamObservedProperties: {
        name: "MultiDatastreamObservedProperties",
        singular: "MultiDatastreamObservedProperty",
        table: "multi_datastream_observedproperty",
        order: -1,
        essai:[apiType.base],
        lora: false,
        columns: {
            multidatastream_id: {
                create: "BIGINT NOT NULL"
            },
            observedproperty_id: {
                create: "BIGINT NOT NULL"
            }
        },
        canPost: false,
        relations: {},
        constraints: {
            multi_datastream_observedproperty_pkey: 'PRIMARY KEY ("multidatastream_id", "observedproperty_id")',
            multi_datastream_observedproperty_multidatastream_id_fkey:
                'FOREIGN KEY ("multidatastream_id") REFERENCES "multidatastream"("id") ON UPDATE CASCADE ON DELETE CASCADE',
            multi_datastream_observedproperty_observedproperty_id_fkey:
                'FOREIGN KEY ("observedproperty_id") REFERENCES "observedproperty"("id") ON UPDATE CASCADE ON DELETE CASCADE'
        },
        indexes: {
            multi_datastream_observedproperty_multidatastream_id: 'ON public."multi_datastream_observedproperty" USING btree ("multidatastream_id")',
            multi_datastream_observedproperty_observedproperty_id: 'ON public."multi_datastream_observedproperty" USING btree ("observedproperty_id")'
        }
    },

    Observations: {
        name: "Observations",
        singular: "Observation",
        table: "observation",
        order: 7,
        essai:[apiType.base],
        lora: false,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                alias: makeIDAlias("observation"),
                type : "number"
            },
            phenomenonTime: {
                create: "timestamptz NOT NULL",
                type : "date"
            },
            result: {
                create: "",
                alias: ` CASE 
                WHEN "observation"."_resultnumber" IS NOT NULL THEN json_object_agg('result',"observation"."_resultnumber")->'result'
                WHEN "observation"."_resultnumbers" IS NOT NULL THEN ( SELECT json_object_agg(key, value) 
                  FROM ( SELECT jsonb_array_elements_text("keys") AS key, unnest("observation"."_resultnumbers")::float4 AS value 
                  FROM (SELECT (SELECT jsonb_agg(tmp.units -> 'name') AS keys FROM (SELECT jsonb_array_elements("unitOfMeasurements") AS units 
                  FROM "multidatastream" where id = "multidatastream_id" ) AS tmp) ) AS tmp2 ) AS tmp3)
                WHEN "observation"."_resultjson" IS NOT NULL THEN json_object_agg('result',"observation"."_resultjson")->'result'
                WHEN "observation"."_resulttexts" IS NOT NULL THEN json_object_agg('result',(SELECT json_object_agg(key, value) 
                  FROM ( SELECT replace(unnest(keys), '"','') as key, unnest("observation"."_resulttexts") AS value 
                  FROM ( SELECT keys FROM  string_to_array((select "unitOfMeasurement"->'name'::text 
                  FROM "datastream" WHERE id = coalesce("datastream_id", "multidatastream_id"))::text, ',') keys ) AS tmp2 ) AS tmp3 ))->'result'
                WHEN "observation"."_resulttext" IS NOT NULL THEN json_object_agg('result',"observation"."_resulttext")->'result'
                end as "result"`,
                alias_lora: ` CASE 
                WHEN "observation"."_resultnumber" IS NOT NULL THEN json_object_agg('result',"observation"."_resultnumber")->'result'
                WHEN "observation"."_resultnumbers" IS NOT NULL THEN json_object_agg('result',"observation"."_resultnumbers")->'result'
                WHEN "observation"."_resultjson" IS NOT NULL THEN json_object_agg('result',"observation"."_resultjson")->'result'
                WHEN "observation"."_resulttexts" IS NOT NULL THEN json_object_agg('result',(SELECT json_object_agg(key, value) 
                  FROM ( SELECT replace(unnest(keys), '"','') as key, unnest("observation"."_resulttexts") AS value 
                  FROM ( SELECT keys FROM  string_to_array((select "unitOfMeasurement"->'name'::text 
                  FROM "datastream" WHERE id = coalesce("datastream_id", "multidatastream_id"))::text, ',') keys ) AS tmp2 ) AS tmp3 ))->'result'
                WHEN "observation"."_resulttext" IS NOT NULL THEN json_object_agg('result',"observation"."_resulttext")->'result'
                end as "result"`,
             type : "json"
            },
            _resultint: {
                create: "int NULL",
                type : "number"
            },
            _resultnumber: {
                create: "float4 NULL",
                type : "number"
            },
            _resultnumbers: {
                create: "float4[] NULL",
                type : "number[]"
            },
            _resultjson: {
                create: "jsonb NULL",
                type : "json"
            },
            _resulttexts: {
                create: "text[] NULL",
                type : "string[]"
            },
            _resulttext: {
                create: "text NULL",
                type : "string"
            },
            resultTime: {
                create: "timestamptz NOT NULL",
                type : "date"
            },
            resultQuality: {
                create: "jsonb NULL",
                type : "json"
            },
            validTime: {
                create: "timestamptz DEFAULT CURRENT_TIMESTAMP",
                type : "date"
            },
            parameters: {
                create: "jsonb NULL",
                type : "json"
            },
            datastream_id: {
                create: "BIGINT NULL",
                type : "relation:Datastreams"
            },
            multidatastream_id: {
                create: "BIGINT NULL",
                type : "relation:MultiDatastreams"
            },
            featureofinterest_id: {
                create: "BIGINT NOT NULL DEFAULT 1",
                type : "relation:FeaturesOfInterest"
            }
        },
        constraints: {
            observation_pkey: 'PRIMARY KEY ("id")',
            observation_unik_datastream_resultnumber: 'UNIQUE ("phenomenonTime", "resultTime", "datastream_id", "featureofinterest_id", "_resultnumber")',
            observation_unik_datastream_resultnumbers: 'UNIQUE ("phenomenonTime", "resultTime", "datastream_id","featureofinterest_id", "_resultnumbers")',
            observation_unik_datastream_resultjson: 'UNIQUE ("phenomenonTime", "resultTime", "datastream_id","featureofinterest_id", "_resultjson")',
            observation_unik_datastream_resulttext: 'UNIQUE ("phenomenonTime", "resultTime", "datastream_id","featureofinterest_id", "_resulttext")',
            observation_unik_datastream_resulttexts: 'UNIQUE ("phenomenonTime", "resultTime", "datastream_id","featureofinterest_id", "_resulttexts")',
            observation_unik_datastream_resultint: 'UNIQUE ("phenomenonTime", "resultTime", "datastream_id","featureofinterest_id", "_resultint")',
            observation_unik_multidatastream_resultnumber: 'UNIQUE ("phenomenonTime", "resultTime", "multidatastream_id", "featureofinterest_id", "_resultnumber")',
            observation_unik_multidatastream_resultnumbers: 'UNIQUE ("phenomenonTime", "resultTime", "multidatastream_id","featureofinterest_id", "_resultnumbers")',
            observation_unik_multidatastream_resultjson: 'UNIQUE ("phenomenonTime", "resultTime", "multidatastream_id","featureofinterest_id", "_resultjson")',
            observation_unik_multidatastream_resulttext: 'UNIQUE ("phenomenonTime", "resultTime", "multidatastream_id","featureofinterest_id", "_resulttext")',
            observation_unik_multidatastream_resulttexts: 'UNIQUE ("phenomenonTime", "resultTime", "multidatastream_id","featureofinterest_id", "_resulttexts")',
            observation_unik_multidatastream_resultint: 'UNIQUE ("phenomenonTime", "resultTime", "multidatastream_id","featureofinterest_id", "_resultint")',
            observation_datastream_id_fkey: 'FOREIGN KEY ("datastream_id") REFERENCES "datastream"("id") ON UPDATE CASCADE ON DELETE CASCADE',
            observation_multidatastream_id_fkey: 'FOREIGN KEY ("multidatastream_id") REFERENCES "multidatastream"("id") ON UPDATE CASCADE ON DELETE CASCADE',
            observation_featureofinterest_id_fkey: 'FOREIGN KEY ("featureofinterest_id") REFERENCES "featureofinterest"("id") ON UPDATE CASCADE ON DELETE CASCADE'
        },
        indexes: {
            observation_datastream_id: 'ON public."observation" USING btree ("datastream_id")',
            observation_multidatastream_id: 'ON public."observation" USING btree ("multidatastream_id")',
            observation_featureofinterest_id: 'ON public."observation" USING btree ("featureofinterest_id")'
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
                tableKey: "id"
            },
            MultiDatastream: {
                type: Erelations.belongsTo,
                expand: `"multidatastream"."id" = "observation"."multidatastream_id"`,
                link: `"multidatastream"."id" = (SELECT "observation"."multidatastream_id" FROM "observation" WHERE "observation"."id" = $ID)`,
                entityName: "MultiDatastreams",
                tableName: "observation",
                relationKey: "id",
                entityColumn: "multidatastream_id",
                tableKey: "id"
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
                tableKey: "id"
            }
        }
    },

    HistoricalObservations: {
        name: "HistoricalObservations",
        singular: "HistoricalObservation",
        table: "historical_observation",
        order: -1,
        essai:[apiType.base],
        lora: false,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                alias: makeIDAlias("historical_observation")
            },
            validTime: {
                create: "timestamptz DEFAULT CURRENT_TIMESTAMP"
            },
            _resultnumber: {
                create: "float4 NULL"
            },
            _resultnumbers: {
                create: "float4[] NULL"
            },
            observation_id: {
                create: "BIGINT NULL"
            }
        },
        constraints: {
            HistoricalObservations_pkey: 'PRIMARY KEY ("id")',
            HistoricalObservations_id_fkey: 'FOREIGN KEY ("observation_id") REFERENCES "observation"("id") ON UPDATE CASCADE ON DELETE CASCADE'
        },
        indexes: {
            HistoricalObservations_observation_id: 'ON public."historical_observation" USING btree ("observation_id")'
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
                tableKey: "id"
            }
        }
    },

    ThingsLocations: {
        name: "ThingsLocations",
        singular: "ThingLocation",
        table: "thing_location",
        order: -1,
        essai:[apiType.base],
        lora: false,
        columns: {
            thing_id: {
                create: "BIGINT NOT NULL"
            },
            location_id: {
                create: "BIGINT NOT NULL"
            }
        },
        canPost: false,
        relations: {},
        constraints: {
            thing_location_pkey: 'PRIMARY KEY ("thing_id", "location_id")',
            thing_location_location_id_fkey: 'FOREIGN KEY ("location_id") REFERENCES "location"("id") ON UPDATE CASCADE ON DELETE CASCADE',
            thing_location_thing_id_fkey: 'FOREIGN KEY ("thing_id") REFERENCES "thing"("id") ON UPDATE CASCADE ON DELETE CASCADE'
        },
        indexes: {
            thing_location_location_id: 'ON public."thing_location" USING btree ("location_id")',
            thing_location_thing_id: 'ON public."thing_location" USING btree ("thing_id")'
        }
    },

    Decoders: {
        name: "Decoders",
        singular: "Decoder",
        table: "decoder",
        order: 12,
        essai:[apiType.lora],
        lora: true,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                alias: makeIDAlias("decoder"),
                type : "number"
            },
            name: {
                create: "text NOT NULL DEFAULT 'no name'::text",
                type : "text"
            },
            description: {
                create: "text NOT NULL DEFAULT 'no description'::text",
                type : "text"
            },
            properties: {
                create: "jsonb NULL",
                type : "json"
            },
            code: {
                create: "text NOT NULL DEFAULT 'const decoded = null; return decoded;'::text",
                type : "text"
            },
            nomenclature: {
                create: "text NOT NULL DEFAULT 'const nomenclature = {}'::text",
                type : "jsonb"
            },
            synonym: {
                create: "text NULL",
                type : "jsonb"
            },
            test: {
                create: "text NULL",
                type : "text"
            },
            dataKeys: {
                create: "text[] NULL",
                type : "string[]"
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
                tableKey: "id"
            }
        }
    },

    Loras: {
        name: "Loras",
        singular: "Lora",
        table: "lora",
        order: 11,
        essai:[apiType.lora],
        lora: true,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                alias: makeIDAlias("lora"),
                type : "number"
            },
            name: {
                create: "text NOT NULL DEFAULT 'no name'::text",
                type : "text"
            },
            description: {
                create: "text NOT NULL DEFAULT 'no description'::text",
                type : "text"
            },
            properties: {
                create: "jsonb NULL",
                type : "json"
            },
            deveui: {
                create: "text NOT NULL",
                type : "text"
            },
            decoder_id: {
                create: "BIGINT NOT NULL",
                type : "relation:Decoders"
            },
            datastream_id: {
                create: "BIGINT NULL",
                type : "relation:Datastreams"
            },
            multidatastream_id: {
                create: "BIGINT NULL",
                type : "relation:MultiDatastreams"
            }
        },
        constraints: {
            lora_pkey: 'PRIMARY KEY ("id")',
            lora_unik_deveui: 'UNIQUE ("deveui")',
            // lora_datastream_id_fkey: 'FOREIGN KEY ("datastream_id") REFERENCES "datastream"("id") ON UPDATE CASCADE ON DELETE CASCADE',
            lora_multidatastream_id_fkey: 'FOREIGN KEY ("multidatastream_id") REFERENCES "multidatastream"("id") ON UPDATE CASCADE ON DELETE CASCADE',
            lora_decoder_fkey: 'FOREIGN KEY ("decoder_id") REFERENCES "decoder"("id") ON UPDATE CASCADE ON DELETE CASCADE'
        },
        indexes: {
            lora_datastream_id: 'ON public."lora" USING btree ("datastream_id")',
            lora_multidatastream_id: 'ON public."lora" USING btree ("multidatastream_id")',
            decoder_id: 'ON public."lora" USING btree ("decoder_id")'
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
                tableKey: "id"
            },
            MultiDatastream: {
                type: Erelations.belongsTo,
                expand: `"multidatastream"."id" = "lora"."multidatastream_id"`,
                link: `"multidatastream"."id" = (SELECT "lora"."multidatastream_id" FROM "lora" WHERE "lora"."id" = $ID)`,
                entityName: "MultiDatastreams",
                tableName: "lora",
                relationKey: "id",
                entityColumn: "multidatastream_id",
                tableKey: "id"
            },
            Decoder: {
                type: Erelations.belongsTo,
                expand: `"decoder"."id" = "lora"."decoder_id"`,
                link: `"decoder"."id" = (SELECT "lora"."decoder_id" FROM "lora" WHERE "lora"."id" = $ID)`,
                entityName: "Decoders",
                tableName: "lora",
                relationKey: "id",
                entityColumn: "decoder_id",
                tableKey: "id"
            }
        }
    },

    Users: {
        name: "Users",
        singular: "User",
        table: "user",
        order: 21,
        canPost: true,
        essai:[apiType.admin],
        lora: true,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY"
            },
            username: {
                create: "text NOT NULL UNIQUE"
            },
            email: {
                create: "text NOT NULL"
            },
            password: {
                create: "text NOT NULL"
            },
            database: {
                create: "text NOT NULL"
            },
            canPost: {
                create: "bool NULL"
            },
            canDelete: {
                create: "bool NULL"
            },
            canCreateUser: {
                create: "bool NULL"
            },
            canCreateDb: {
                create: "bool NULL"
            },
            admin: {
                create: "bool NULL"
            },
            superAdmin: {
                create: "bool NULL"
            }
        },
        relations: {}
    },

    Logs: {
        name: "Logs",
        singular: "Log_request",
        table: "log_request",
        order: 22,
        canPost: true,
        essai:[apiType.logged, apiType.admin],
        lora: true,
        columns: {
            id: {
                create: "BIGINT GENERATED ALWAYS AS IDENTITY",
                alias: makeIDAlias("log_request"),
                type : "number"
            },
            entityid: {
                create: "BIGINT",
                type : "number"
            },
            replayid: {
                create: "BIGINT",
                type : "number"
            },
            date: {
                create: "timestamptz DEFAULT CURRENT_TIMESTAMP",
                type : "date"
            },
            user_id: {
                create: "BIGINT",
                type : "number"
            },
            method: {
                create: "text",
                type : "text"
            },
            code: {
                create: "INT",
                type : "number"
            },
            url: {
                create: "text NOT NULL",
                type : "text"
            },
            datas: {
                create: "jsonb NULL",
                type : "json"
            },
            port: {
                create: "INT NULL",
                type : "number"
            },
            database: {
                create: "text NULL",
                type : "text"
            },
            return: {
                create: "text NULL",
                type : "json"
            },
            error: {
                create: "text NULL",
                type : "text"
            },
        },
        relations: {}
    },

    Configs: {
        name: "Configs",
        singular: "Config",
        table: "config",
        order: 20,
        canPost: true,
        essai:[apiType.logged, apiType.admin],
        lora: false,
        columns: {
            name: {
                create: "TEXT UNIQUE NOT NULL",
                type : "text"
            },
            key: {
                create: "text",
                type : "text"
            },
            pghost: {
                create: "text NOT NULL",
                type : "text"
            },
            pgport: {
                create: "int",
                type : "number"
            },
            port: {
                create: "int",
                type : "number"
            },
            pguser: {
                create: "text NOT NULL",
                type : "text"
            },
            pgpassword: {
                create: "text NOT NULL",
                type : "text"
            },
            apiVersion: {
                create: "text NOT NULL",
                type : "text"
            },
            dateformat: {
                create: "text NOT NULL",
                type : "text"
            },
            webSite: {
                create: "text NOT NULL",
                type : "text"
            },
            nbpage: {
                create: "int",
                type : "number"
            },
            retry: {
                create: "int",
                type : "number"
            },
            createUser: {
                create: "bool NOT NULL DEFAULT TRUE",
                type : "boolean"
            },
            forceHttps: {
                create: "bool NOT NULL DEFAULT FALSE",
                type : "boolean"
            },
            alias: {
                create: "text NOT NULL",
                type : "text"
            },
            lora: {
                create: "bool NOT NULL DEFAULT FALSE",
                type : "boolean"
            },
            multiDatastream: {
                create: "bool NOT NULL DEFAULT TRUE",
                type : "boolean"
            },
            highPrecision: {
                create: "bool NOT NULL DEFAULT FALSE",
                type : "boolean"
            },
            logFile: {
                create: "text NOT NULL",
                type : "text"
            }
        },
        constraints: {
            config_pkey: 'PRIMARY KEY ("name")',
        },
        indexes: {},
        relations: {}
    },
    
    CreateObservations: {
        name: "CreateObservations",
        singular: "CreateObservation",
        table: "",
        order: 0,
        essai:[apiType.logged],
        lora: false,
        columns: {},
        canPost: true,
        relations: {},
        constraints: {},
        indexes: {}
    },    

    CreateFile: {
        name: "CreateFile",
        singular: "CreateFile",
        table: "",
        order: 0,
        essai:[apiType.logged],
        lora: false,
        columns: {},
        canPost: true,
        relations: {},
        constraints: {},
        indexes: {}
    }    
};

export const _DB = Object.freeze(dbDatas);
export const _DBFILTERED = (input: koa.Context | string[]) => Array.isArray(input) 
    ? Object.fromEntries(Object.entries(_DB).filter(([k,v]) => input.includes(k)))
    : Object.fromEntries(Object.entries(_DB).filter(([k,v]) => input._config.entities.includes(k) || _DB[k].essai.includes(apiType.logged) && input._user.id > 0));
export const _DBADMIN = Object.fromEntries(Object.entries(_DB).filter(([k,v]) => v.essai.includes(apiType.admin)));
 