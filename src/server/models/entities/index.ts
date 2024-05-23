/**
 * Index Entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { allEntities } from "../../enums";
import { errors, msg } from "../../messages";
import { Ientity } from "../../types";
import { Ientity1 } from "../../types/entity";

const singular = (input: string) : string => {
  if (input.endsWith("ies")) input = input.slice(0, -3) + "y";
  if (input.endsWith("s")) input = input.slice(0, -1);
  return input.split("").map((e, i) => {
    if (!(e === "s" && /^[A-Z]*$/.test(input[i+1]) ) )return e;      
  }).join("").trim();
};

export const createEntity = (name: string, datas?: Ientity1) : Ientity => {
  // @ts-ignore  
  const entity = allEntities[name];
    if (entity) {
      const t = singular(entity);
      return datas ? {
        name: name,
        singular: t,
        table: t.toLowerCase(),
        ... datas
      } :  {
        name: name,
        singular: t,
        table: "",
        createOrder: 99,
        order: 0,
        orderBy: "",
        columns: {},
        relations: {},
        constraints: {},
        indexes: {},
      };
    }
    throw new Error(msg( errors.noValidEntity, name));
  };
  
export const Config: Ientity = createEntity("Configs");
export const CreateFile: Ientity = createEntity("CreateFile");
export const CreateObservation:Ientity = createEntity("CreateObservations");
export { Datastream } from "./datastream";
export { Decoder } from "./decoder";
export { FeatureOfInterest } from "./featureOfInterest";
export { HistoricalLocation } from "./historicalLocation";
export { HistoricalObservation } from "./historicalObservation";
export { Location } from "./location";
export { LocationHistoricalLocation } from "./locationHistoricalLocation";
export { Log } from "./log";
export { Lora } from "./lora";
export { MultiDatastream } from "./multiDatastream";
export { MultiDatastreamObservedProperty } from "./multiDatastreamObservedProperty";
export { Observation } from "./observation";
export { ObservedProperty } from "./observedProperty";
export { Sensor } from "./sensor";
export { Thing } from "./thing";
export { ThingLocation } from "./thingLocation";
export { User } from "./user";