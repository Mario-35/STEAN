/**
 * entity ObservedProperty.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType, Erelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";

export const ObservedProperty:Ientity = {
name: "ObservedProperties",
singular: "ObservedProperty",
table: "observedproperty",
createOrder: 5,
order: 8,
extensions: [EextensionsType.base],
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
};