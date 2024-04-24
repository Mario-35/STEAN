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

export const createEntity = (name: string, datas : Ientity1) : Ientity => {  
    const singular = allEntities[name];
    if(singular) return  {
      name: name,
      singular: singular,
      table: singular.replace(/[_]+/g, "").toLowerCase(),
      ... datas
    }
    throw new Error(msg( errors.noValidEntity, name));
  };
  
export { Config } from "./config";
export { CreateFile } from "./createFile";
export { CreateObservation } from "./createObservation";
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