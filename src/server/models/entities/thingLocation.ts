/**
 * entity ThingLocation.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EextensionsType } from "../../enums";
import { Ientity } from "../../types";


  export const ThingLocation:Ientity = {
    name: "ThingsLocations",
    singular: "ThingLocation",
    table: "thing_location",
    createOrder: 3,
    order: -1,
    extensions: [EextensionsType.base],
    orderBy: `"thing_id"`,
    columns: {
      thing_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "bigint"
      },
      location_id: {
        create: "BIGINT NOT NULL",
        columnAlias() {
          return undefined;
        },
        type: "bigint"
      },
    },
    relations: {},
    constraints: {
      thing_location_pkey: 'PRIMARY KEY ("thing_id", "location_id")',
      thing_location_location_id_fkey:
        'FOREIGN KEY ("location_id") REFERENCES "location"("id") ON UPDATE CASCADE ON DELETE CASCADE',
      thing_location_thing_id_fkey:
        'FOREIGN KEY ("thing_id") REFERENCES "thing"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      thing_location_location_id:
        'ON public."thing_location" USING btree ("location_id")',
      thing_location_thing_id:
        'ON public."thing_location" USING btree ("thing_id")',
    },
  };