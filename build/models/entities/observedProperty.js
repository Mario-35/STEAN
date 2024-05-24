"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.ObservedProperty=void 0;const _1=require("."),enums_1=require("../../enums"),constants_1=require("./constants");exports.ObservedProperty=(0,_1.createEntity)("ObservedProperties",{createOrder:5,order:8,orderBy:'"id"',columns:{id:{create:constants_1._id,alias(e,t){return'"id"'+(t.alias&&!0===t.alias==!0?' AS "@iot.id"':"")},type:"number"},name:{create:(0,constants_1._text)("no name"),alias(){},type:"text"},definition:{create:(0,constants_1._text)("no definition"),alias(){},type:"text"},description:{create:(0,constants_1._text)("no description"),alias(){},type:"text"}},constraints:{observedproperty_pkey:'PRIMARY KEY ("id")',observedproperty_unik_name:'UNIQUE ("name")'},relations:{Datastreams:{type:enums_1.EnumRelations.hasMany,expand:'"datastream"."id" in (SELECT "datastream"."id" from "datastream" WHERE "datastream"."observedproperty_id" = "observedproperty"."id")',link:'"datastream"."id" in (SELECT "datastream"."id" FROM "datastream" WHERE "datastream"."observedproperty_id" = $ID)',entityName:"Datastreams",tableName:"datastream",relationKey:"observedproperty_id",entityColumn:"id",tableKey:"id"},MultiDatastreams:{type:enums_1.EnumRelations.hasMany,expand:'"multidatastream"."id" in (SELECT "multidatastreamobservedproperty"."multidatastream_id" FROM "multidatastreamobservedproperty" WHERE "multidatastreamobservedproperty"."observedproperty_id" = "observedproperty"."id")',link:'"multidatastream"."id" in (SELECT "multidatastreamobservedproperty"."multidatastream_id" FROM "multidatastreamobservedproperty" WHERE "multidatastreamobservedproperty"."observedproperty_id" = $ID)',entityName:"MultiDatastreams",tableName:"multidatastreamobservedproperty",relationKey:"observedproperty_id",entityColumn:"multidatastream_id",tableKey:"multidatastream_id"}}});