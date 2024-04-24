/**
 * entity Datastream.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createEntity } from ".";
import { EnumDatesType, EnumObservationType, EnumRelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";

export const Datastream:Ientity  = createEntity("Datastreams", {
  createOrder: 7,
    order: 1,
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
      observationType: {
        create:
          "text NOT NULL DEFAULT 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement'::text",
        columnAlias() {
          return undefined;
        },
        type: "list",
        verify: {
          list: Object.keys(EnumObservationType),
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
          return `CONCAT(to_char("_phenomenonTimeStart",'${EnumDatesType.date}'),'/',to_char("_phenomenonTimeEnd",'${EnumDatesType.date}')) AS "phenomenonTime"`;
        },
        type: "text",
      },
      resultTime: {
        create: "",
        columnAlias(config: IconfigFile, test: IKeyBoolean | undefined) {
          return `CONCAT(to_char("_resultTimeStart",'${EnumDatesType.date}'),'/',to_char("_resultTimeEnd",'${EnumDatesType.date}')) AS "resultTime"`;
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
    relations: {
      Thing: {
        type: EnumRelations.belongsTo,
        expand: `"thing"."id" = "datastream"."thing_id"`,
        link: `"thing"."id" = (SELECT "datastream"."thing_id" from "datastream" WHERE "datastream"."id" =$ID)`,
        entityName: "Things",
        tableName: "datastream",
        relationKey: "id",
        entityColumn: "thing_id",
        tableKey: "id",
      },
      Sensor: {
        type: EnumRelations.belongsTo,
        expand: `"sensor"."id" = "datastream"."sensor_id"`,
        link: `"sensor"."id" = (SELECT "datastream"."sensor_id" from "datastream" WHERE "datastream"."id" =$ID)`,        
        entityName: "Sensors",
        tableName: "datastream",
        relationKey: "id",
        entityColumn: "sensor_id",
        tableKey: "id",
      },
      ObservedProperty: {
        type: EnumRelations.belongsTo,
        expand: `"observedproperty"."id" = "datastream"."observedproperty_id"`,
        link: `"observedproperty"."id" = (SELECT "datastream"."observedproperty_id" from "datastream" WHERE "datastream"."id" =$ID)`,
        entityName: "ObservedProperties",
        tableName: "datastream",
        relationKey: "id",
        entityColumn: "observedproperty_id",
        tableKey: "id",
      },
      Observations: {
        type: EnumRelations.hasMany,
        expand: `"observation"."id" in (SELECT "observation"."id" from "observation" WHERE "observation"."datastream_id" = "datastream"."id" ORDER BY "observation"."resultTime" ASC)`,
        link: `"observation"."id" in (SELECT "observation"."id" from "observation" WHERE "observation"."datastream_id" = $ID ORDER BY "observation"."resultTime" ASC)`,
        entityName: "Observations",
        tableName: "observation",
        relationKey: "datastream_id",
        entityColumn: "id",
        tableKey: "id",
      },
      Lora: {
        type: EnumRelations.belongsTo,
        expand: `"lora"."id" = (SELECT "lora"."id" from "lora" WHERE "lora"."datastream_id" = "datastream"."id")`,
        link: `"lora"."id" = (SELECT "lora"."id" from "lora" WHERE "lora"."datastream_id" = $ID)`,
        entityName: "Loras",
        tableName: "lora",
        relationKey: "datastream_id",
        entityColumn: "id",
        tableKey: "id",
      },
      FeatureOfInterest: {
        type: EnumRelations.belongsTo,
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
  });