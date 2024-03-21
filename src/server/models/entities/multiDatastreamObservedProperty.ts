/**
 * entity MultiDatastreamObservedProperty.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType } from "../../enums";
import { Ientity } from "../../types";

  export const MultiDatastreamObservedProperty:Ientity = {

    name: "MultiDatastreamObservedProperties",
    singular: "MultiDatastreamObservedProperty",
    table: "multi_datastream_observedproperty",
    createOrder: 9,
    order: -1,
    extensions: [EextensionsType.multiDatastream],
    orderBy: `"multidatastream_id"`,
    count: `SELECT count(DISTINCT id) from "multi_datastream_observedproperty" AS count` ,
    columns: {
      multidatastream_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "bigint"
      },
      observedproperty_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "bigint"
      },
    },
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
  };