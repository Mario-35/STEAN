/**
 * entity Decoder.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createEntity } from ".";
import { EnumRelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";

export const Decoder:Ientity  = createEntity("Decoders", {
    createOrder: 10,
    order: 12,
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
    relations: {
      Loras: {
        type: EnumRelations.hasMany,
        expand: `"lora"."id" in (SELECT "lora"."id" from "lora" WHERE "lora"."decoder_id" = "decoder"."id")`,
        link: `"lora"."id" in (SELECT "lora"."id" from "lora" WHERE "lora"."decoder_id" = $ID)`,
        entityName: "Loras",
        tableName: "lora",
        relationKey: "decoder_id",
        entityColumn: "id",
        tableKey: "id",
      },
    },
  });