/**
 * entity ObservedProperty.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- entity ObservedProperty. -----------------------------------!");
import { createEntity } from ".";
import { EnumRelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";
import { _id, _text } from "./constants";
export const ObservedProperty:Ientity  = createEntity("ObservedProperties", {
    createOrder: 5,
    order: 8,
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
        definition: {
            create: _text('no definition'),
            alias() {},
            type: "text",
        },
        description: {
            create: _text('no description'),
            alias() {},
            type: "text",
        },
    },
    constraints: {
        observedproperty_pkey: 'PRIMARY KEY ("id")',
        observedproperty_unik_name: 'UNIQUE ("name")',
    },
    relations: {
        Datastreams: {
            type: EnumRelations.hasMany,
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
            type: EnumRelations.hasMany,
            expand: `"multidatastream"."id" in (SELECT "multidatastreamobservedproperty"."multidatastream_id" FROM "multidatastreamobservedproperty" WHERE "multidatastreamobservedproperty"."observedproperty_id" = "observedproperty"."id")`,
            link: `"multidatastream"."id" in (SELECT "multidatastreamobservedproperty"."multidatastream_id" FROM "multidatastreamobservedproperty" WHERE "multidatastreamobservedproperty"."observedproperty_id" = $ID)`,
            entityName: "MultiDatastreams",
            tableName: "multidatastreamobservedproperty",
            relationKey: "observedproperty_id",
            entityColumn: "multidatastream_id",
            tableKey: "multidatastream_id",
        },
    },
});