/**
 * entity Lora.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType, Erelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";

export const Lora:Ientity = {
  name: "Loras",
  singular: "Lora",
  table: "lora",
  createOrder: 11,
  order: 11,
  extensions: [EextensionsType.lora],
  orderBy: `"id"`,
  count: `SELECT count(DISTINCT id) from "lora" AS count` ,
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
};