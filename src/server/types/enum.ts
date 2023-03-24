export enum ENTITIES {    
    Things = 'Things' ,
    FeaturesOfInterest = 'FeaturesOfInterest' ,
    Locations = 'Locations' ,
    HistoricalLocations = 'HistoricalLocations' ,
    locationsHistoricalLocations = 'locationsHistoricalLocations' ,
    ObservedProperties = 'ObservedProperties' ,
    Sensors = 'Sensors' ,
    Datastreams = 'Datastreams' ,
    MultiDatastreams = 'MultiDatastreams' ,
    MultiDatastreamObservedProperties = 'MultiDatastreamObservedProperties' ,
    Observations = 'Observations' ,
    HistoricalObservations = 'HistoricalObservations' ,
    ThingsLocations = 'ThingsLocations' ,
    Decoders = 'Decoders' ,
    Loras = 'Loras' ,
    CreateObservations = 'CreateObservations' ,
    CreateFile = 'CreateFile' ,
    Logs = 'Logs',
    Users = 'Users',
    Configs= 'Configs',
}

export const enum FORMATS {    
    json = "json", 
    csv = "csv",
    txt = "txt", 
    sql = "sql", 
    html = "html", 
    icon = "icon", 
    graph = "graph", 
    graphDatas = "graphDatas", 
    dataArray = "dataArray", 
    css = "css", 
    js = "js", 
    png = "png", 
    jpg = "jpg", 
    jpeg = "jpeg", 
    ico = "ico"
}

export enum MODES {  
    HEAD = "HEAD",
    DEBUG = "DEBUG", 
    RESULT = "RESULT",
    INFO = "INFO", 
    ERROR = "ERROR", 
    ENV = "ENV", 
    CLASS = "CLASS", 
    OVERRIDE = "OVERRIDE"
}

export enum RELATIONS {
    belongsTo,
    belongsToMany,
    hasMany
}

export enum USERRIGHTS {
    Post = 0,
    Delete = 1,
    Create = 2,
    UserCreate = 3,
    Admin = 4,
    SuperAdmin = 5
}

export enum OPERATIONTYPE { Table,
    Relation,
    Association
}