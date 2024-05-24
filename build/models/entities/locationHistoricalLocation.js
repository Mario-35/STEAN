"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.LocationHistoricalLocation=void 0;const _1=require("."),constants_1=require("./constants");exports.LocationHistoricalLocation=(0,_1.createEntity)("locationsHistoricalLocations",{createOrder:-1,order:-1,orderBy:'"location_id"',columns:{location_id:{create:constants_1._idRel,alias(){},type:"bigint"},historicallocation_id:{create:constants_1._idRel,alias(){},type:"bigint"}},constraints:{locationhistoricallocation_pkey:'PRIMARY KEY ("location_id", "historicallocation_id")',locationhistoricallocation_historicallocation_id_fkey:'FOREIGN KEY ("historicallocation_id") REFERENCES "historicallocation"("id") ON UPDATE CASCADE ON DELETE CASCADE',locationhistoricallocation_location_id_fkey:'FOREIGN KEY ("location_id") REFERENCES "location"("id") ON UPDATE CASCADE ON DELETE CASCADE'},indexes:{locationhistoricallocation_historicallocation_id:'ON public."locationhistoricallocation" USING btree ("historicallocation_id")',locationhistoricallocation_location_id:'ON public."locationhistoricallocation" USING btree ("location_id")'},relations:{}});