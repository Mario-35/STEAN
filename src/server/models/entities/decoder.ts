/**
 * entity Decoder.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- entity Decoder. -----------------------------------!");
import { createEntity } from ".";
import { EnumRelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";
import { _id, _text } from "./constants";

export const Decoder:Ientity  = createEntity("Decoders", {
    createOrder: 10,
    order: 12,
    orderBy: `"id"`,
    columns: {
      id: {
        create: _id,
        alias(config: IconfigFile, test: IKeyBoolean) {
           return `"id"${test["alias"] && test["alias"] === true  === true ? ` AS "@iot.id"`: ''}` ;
        },
        type: "number",
      },
      name: {
        create: _text('no name'),
        alias() {},
        type: "text",
      },
      hash: {
        create: "TEXT NULL",
        alias() {},
        type: "text",
      },
      code: {
        create: _text('const decoded = null; return decoded;'),
        alias() {},
        type: "text",
      },
      nomenclature: {
        create: _text('{}'),
        alias() {},
        type: "jsonb",
      },
      synonym: {
        create: "TEXT NULL",
        alias() {},
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