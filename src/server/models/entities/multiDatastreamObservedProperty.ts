/**
 * entity MultiDatastreamObservedProperty.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createEntity } from ".";
import { Ientity } from "../../types";
    export const MultiDatastreamObservedProperty:Ientity  = createEntity("MultiDatastreamObservedProperties", {
    createOrder: 9,
    order: -1,
    orderBy: `"multidatastream_id"`,
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
      multidatastreamobservedproperty_pkey:
        'PRIMARY KEY ("multidatastream_id", "observedproperty_id")',
      multidatastreamobservedproperty_multidatastream_id_fkey:
        'FOREIGN KEY ("multidatastream_id") REFERENCES "multidatastream"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      multidatastreamobservedproperty_observedproperty_id_fkey:
        'FOREIGN KEY ("observedproperty_id") REFERENCES "observedproperty"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      multidatastreamobservedproperty_multidatastream_id:
        'ON public."multidatastreamobservedproperty" USING btree ("multidatastream_id")',
      multidatastreamobservedproperty_observedproperty_id:
        'ON public."multidatastreamobservedproperty" USING btree ("observedproperty_id")',
    },
  });