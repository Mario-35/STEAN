/**
 * entity HistoricalObservation.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { createEntity } from ".";
import { EnumRelations } from "../../enums";
import { IconfigFile, Ientity, IKeyBoolean } from "../../types";

  export const HistoricalObservation:Ientity  = createEntity("HistoricalObservations", {
    createOrder: -1,
    order: -1,
    orderBy: `"id"`,
    columns: {
      id: {
        create: "BIGINT GENERATED ALWAYS AS IDENTITY",
        columnAlias(config: IconfigFile, test: IKeyBoolean) {
           return `"id"${test["alias"] && test["alias"] === true  === true ? ` AS "@iot.id"`: ''}` ;
        },
        type: "bigint"
      },
      validTime: {
        create: "timestamptz DEFAULT CURRENT_TIMESTAMP",
        columnAlias() {
          return undefined;
        },
        type: "date"
      },
      _result: {
        create: "jsonb NULL",
        columnAlias() {
          return undefined;
        },
        type: "json"
      },
      observation_id: {
        create: "BIGINT NULL",
        columnAlias() {
          return undefined;
        },
        type: "bigint"
      },
    },
    constraints: {
      HistoricalObservations_pkey: 'PRIMARY KEY ("id")',
      HistoricalObservations_id_fkey:
        'FOREIGN KEY ("observation_id") REFERENCES "observation"("id") ON UPDATE CASCADE ON DELETE CASCADE',
    },
    indexes: {
      HistoricalObservations_observation_id:
        'ON public."historicalobservation" USING btree ("observation_id")',
    },
    relations: {
      Observations: {
        type: EnumRelations.belongsTo,
        expand: `"observation"."id" = "historicalobservation"."observation_id"`,
        link: "err: 501 : Not Implemented.",        
        entityName: "Observations",
        tableName: "observation",
        relationKey: "observation_id",
        entityColumn: "id",
        tableKey: "id",
      },
    },
  });