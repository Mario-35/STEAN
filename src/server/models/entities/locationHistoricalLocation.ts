/**
 * entity LocationHistoricalLocation.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createEntity } from ".";
import { Ientity } from "../../types";

  export const LocationHistoricalLocation:Ientity  = createEntity("locationsHistoricalLocations", {
    createOrder: -1,
    order: -1,
    orderBy: `"location_id"`,
    columns: {
      location_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "bigint"
      },
      historicallocation_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "bigint"
      },
    },
    constraints: {
      locationhistoricallocation_pkey:
        'PRIMARY KEY ("location_id", "historicallocation_id")',
      locationhistoricallocation_historicallocation_id_fkey:
        'FOREIGN KEY ("historicallocation_id") REFERENCES "historicallocation"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      locationhistoricallocation_location_id_fkey:
        'FOREIGN KEY ("location_id") REFERENCES "location"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      locationhistoricallocation_historicallocation_id:
        'ON public."locationhistoricallocation" USING btree ("historicallocation_id")',
      locationhistoricallocation_location_id:
        'ON public."locationhistoricallocation" USING btree ("location_id")',
    },
    relations: {},
  });