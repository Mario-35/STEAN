/**
 * entity MultiDatastream.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
import { createEntity } from ".";
import { EnumDatesType, EnumObservationType, EnumRelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";

export const MultiDatastream:Ientity  = createEntity("MultiDatastreams", {
    createOrder: 8,
    order: 2,
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
          list: Object.keys(EnumObservationType),
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
    relations: {
      Thing: {
        type: EnumRelations.belongsTo,
        expand: `"thing"."id" = "multidatastream"."thing_id"`,
        link: `"thing"."id" = (SELECT "multidatastream"."thing_id" from "multidatastream" WHERE "multidatastream"."id" =$ID)`,        
        entityName: "Things",
        tableName: "multidatastream",
        relationKey: "id",
        entityColumn: "thing_id",
        tableKey: "id",
      },
      Sensor: {
        type: EnumRelations.belongsTo,
        expand: `"sensor"."id" = "multidatastream"."sensor_id"`,
        link: `"sensor"."id" = (SELECT "multidatastream"."sensor_id" from "multidatastream" WHERE "multidatastream"."id" =$ID)`,
        entityName: "Sensors",
        tableName: "multidatastream",
        relationKey: "id",
        entityColumn: "sensor_id",
        tableKey: "id",
      },
      Observations: {
        type: EnumRelations.hasMany,
        expand: `"observation"."id" in (SELECT "observation"."id" from "observation" WHERE "observation"."multidatastream_id" = "multidatastream"."id")`,
        link: `"observation"."id" in (SELECT "observation"."id" from "observation" WHERE "observation"."multidatastream_id" = $ID)`,

        entityName: "Observations",
        tableName: "observation",
        relationKey: "multidatastream_id",
        entityColumn: "id",
        tableKey: "id",
      },
      ObservedProperties: {
        type: EnumRelations.belongsTo,
        expand: `"observedproperty"."id" in (SELECT "multidatastreamobservedproperty"."observedproperty_id" FROM "multidatastreamobservedproperty" WHERE "multidatastreamobservedproperty"."multidatastream_id" = "multidatastream"."id")`,
        link: `"observedproperty"."id" in (SELECT "multidatastreamobservedproperty"."observedproperty_id" FROM "multidatastreamobservedproperty" WHERE "multidatastreamobservedproperty"."multidatastream_id" = $ID)`,
        entityName: "ObservedProperties",
        tableName: "multidatastreamobservedproperty",
        relationKey: "observedproperty_id",
        entityColumn: "multidatastream_id",
        tableKey: "multidatastream_id",
      },
      Lora: {
        type: EnumRelations.belongsTo,
        expand: `"lora"."id" = (SELECT "lora"."id" from "lora" WHERE "lora"."multidatastream_id" = "multidatastream"."id")`,
        link: `"lora"."id" = (SELECT "lora"."id" from "lora" WHERE "lora"."multidatastream_id" = $ID)`,
        entityName: "loras",
        tableName: "lora",
        relationKey: "multidatastream_id",
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
});