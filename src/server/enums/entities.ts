/**
 * entities Enum
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// console.log("!----------------------------------- entities Enum -----------------------------------!");
import { EnumExtensions } from ".";

enum EnumBaseEntities {    
    Things = 'Things',
    FeaturesOfInterest = 'FeaturesOfInterest',
    Locations = 'Locations',
    HistoricalLocations = 'HistoricalLocations',
    locationsHistoricalLocations = 'locationsHistoricalLocations',
    ObservedProperties = 'ObservedProperties',
    Sensors = 'Sensors',
    Datastreams = 'Datastreams',
    Observations = 'Observations',
    HistoricalObservations = 'HistoricalObservations',
    ThingsLocations = 'ThingsLocations',
    CreateObservations = 'CreateObservations',
    CreateFile = 'CreateFile',
}

enum EnumMultiDatastreamEntities {
    MultiDatastreams = 'MultiDatastreams',
    MultiDatastreamObservedProperties = 'MultiDatastreamObservedProperties'
}

enum EnumAdminEntities {
    Users = 'Users',
    Configs = 'Configs' 
}

enum EnumLoraEntities {
    Decoders = 'Decoders',
    Loras = 'Loras'
}

enum EnumLogEntities {
    Logs = 'Logs'
}

export const filterEntities = (exts: string[], name?: string) => {    
    // const exts = (typeof input === "string") ? input === "ALL" ? Object.keys(EnumExtensions) : serverConfig.getConfig(input).extensions : input.extensions;
    let res = EnumBaseEntities;
    if (exts.includes(EnumExtensions.logs)) res = {... res, ... EnumLogEntities};
    if (exts.includes(EnumExtensions.multiDatastream)) res = {... res, ... EnumMultiDatastreamEntities};
    if (exts.includes(EnumExtensions.lora)) res = {... res, ... EnumLoraEntities};
    if (exts.includes(EnumExtensions.admin)) res = {... res, ... EnumAdminEntities};
    return res;
}

export type allEntitiesType = EnumBaseEntities | EnumMultiDatastreamEntities | EnumAdminEntities |  EnumLoraEntities | EnumLogEntities;
export const allEntities = { ...EnumBaseEntities, ... EnumMultiDatastreamEntities , ... EnumAdminEntities , ... EnumLoraEntities , ... EnumLogEntities};

