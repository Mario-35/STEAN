/**
 * entity LocationHistoricalLocation.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType } from "../../enums";
import { Ientity } from "../../types";

  export const LocationHistoricalLocation:Ientity = {
    name: "locationsHistoricalLocations",
    singular: "locationHistoricalLocation",
    table: "location_historical_location",
    createOrder: -1,
    order: -1,
    extensions: [EextensionsType.base],
    orderBy: `"location_id"`,
    columns: {
      location_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "bigint"
      },
      historical_location_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "bigint"
      },
    },
    constraints: {
      location_historical_location_pkey:
        'PRIMARY KEY ("location_id", "historical_location_id")',
      location_historical_location_historical_location_id_fkey:
        'FOREIGN KEY ("historical_location_id") REFERENCES "historical_location"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      location_historical_location_location_id_fkey:
        'FOREIGN KEY ("location_id") REFERENCES "location"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      location_historical_location_historical_location_id:
        'ON public."location_historical_location" USING btree ("historical_location_id")',
      location_historical_location_location_id:
        'ON public."location_historical_location" USING btree ("location_id")',
    },
    relations: {},
  };