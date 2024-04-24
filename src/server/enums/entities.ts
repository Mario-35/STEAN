/**
 * entities Enum.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { EnumExtensions } from ".";
import { serverConfig } from "../configuration";
import { IconfigFile } from "../types";

export enum  EnumBaseEntities {    
    Things = 'Thing',
    FeaturesOfInterest = 'FeatureOfInterest',
    Locations = 'Location',
    HistoricalLocations = 'HistoricalLocation',
    locationsHistoricalLocations = 'locationHistoricalLocation',
    ObservedProperties = 'ObservedProperty',
    Sensors = 'Sensor',
    Datastreams = 'Datastream',
    Observations = 'Observation',
    HistoricalObservations = 'HistoricalObservation',
    ThingsLocations = 'ThingLocation',
    CreateObservations = 'CreateObservations',
    CreateFile = 'CreateFile',
}

enum EnumMultiDatastreamEntities {
    MultiDatastreams = 'MultiDatastream',
    MultiDatastreamObservedProperties = 'MultiDatastreamObservedProperty'
}

enum EnumAdminEntities {
    Users = 'User',
    Configs = 'Config' 
}

enum EnumLoraEntities {
    Decoders = 'Decoder',
    Loras = 'Lora'
}

enum EnumLogEntities {
    Logs = 'Log'
}

export const filterEntities = (input: IconfigFile | string, name?: string) => {    
    const exts = (typeof input === "string") ? input === "ALL" ? Object.keys(EnumExtensions) : serverConfig.getConfig(input).extensions : input.extensions;
    let res = EnumBaseEntities;
    if (exts.includes(EnumExtensions.logs)) res = {... res, ... EnumLogEntities};
    if (exts.includes(EnumExtensions.multiDatastream)) res = {... res, ... EnumMultiDatastreamEntities};
    if (exts.includes(EnumExtensions.lora)) res = {... res, ... EnumLoraEntities};
    if (exts.includes(EnumExtensions.admin)) res = {... res, ... EnumAdminEntities};
    return res;
}

export type allEntitiesType = EnumBaseEntities | EnumMultiDatastreamEntities | EnumAdminEntities |  EnumLoraEntities | EnumLogEntities;
export const allEntities = { ...EnumBaseEntities, ... EnumMultiDatastreamEntities , ... EnumAdminEntities , ... EnumLoraEntities , ... EnumLogEntities};

