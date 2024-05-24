"use strict";var __importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0}),exports.models=void 0;const configuration_1=require("../configuration"),constants_1=require("../constants"),log_1=require("../log"),helpers_1=require("../db/helpers"),queries_1=require("../db/queries"),enums_1=require("../enums"),helpers_2=require("../helpers"),messages_1=require("../messages"),fs_1=__importDefault(require("fs")),logger_1=require("../logger"),conformance_json_1=__importDefault(require("./conformance.json")),entities_1=require("./entities"),testVersion=e=>Object.keys(Models.models).includes(e);class Models{static models={};constructor(){Models.models[enums_1.EnumVersion.v1_0]={Things:entities_1.Thing,FeaturesOfInterest:entities_1.FeatureOfInterest,Locations:entities_1.Location,HistoricalLocations:entities_1.HistoricalLocation,locationsHistoricalLocations:entities_1.LocationHistoricalLocation,ObservedProperties:entities_1.ObservedProperty,Sensors:entities_1.Sensor,Datastreams:entities_1.Datastream,MultiDatastreams:entities_1.MultiDatastream,MultiDatastreamObservedProperties:entities_1.MultiDatastreamObservedProperty,Observations:entities_1.Observation,HistoricalObservations:entities_1.HistoricalObservation,ThingsLocations:entities_1.ThingLocation,Decoders:entities_1.Decoder,Loras:entities_1.Lora,Logs:entities_1.Log,Users:entities_1.User,Configs:entities_1.Config,CreateObservations:entities_1.CreateObservation,CreateFile:entities_1.CreateFile}}escape(e,t){const s={">":"&gt;","<":"&lt;","'":"&apos;",'"':"&quot;","&":"&amp;"};if(null!=e)return t=(t||"").replace(/[^&"<>\']/g,""),t="([&\"<>'])".replace(new RegExp("["+t+"]","g"),""),e.replace(new RegExp(t,"g"),function(e,t){return s[t]})}getDraw(e){const t=e=>{var e=`<mxCell id="${e}"`,t="</mxCell>";r=r.replace(e+r.split(e)[1].split(t)[0]+t,"")},s=Models.models[e.config.apiVersion];let r=fs_1.default.readFileSync(__dirname+"/model.drawio","utf8");return r=r.replace("&gt;Version&lt;",`&gt;version : ${e.config.apiVersion}&lt;`),e.config.extensions.includes(enums_1.EnumExtensions.logs)||t("124"),e.config.extensions.includes(enums_1.EnumExtensions.multiDatastream)||(["114","115","117","118","119","116","120","121"].forEach(e=>t(e)),r=(r=(r=r.replace("&lt;hr&gt;COLUMNS."+s.MultiDatastreams.name,"")).replace("&lt;hr&gt;COLUMNS."+s.MultiDatastreams.name,"")).replace(`&lt;strong&gt;${s.MultiDatastreams.singular}&lt;/strong&gt;`,"")),Object.keys(s).forEach(t=>{r=r.replace("COLUMNS."+s[t].name,this.getColumnListNameWithoutId(s[t]).map(e=>`&lt;p style=&quot;margin: 0px; margin-left: 8px;&quot;&gt;${e}: ${s[t].columns[e].type.toUpperCase()}&lt;/p&gt;`).join(""))}),r}async getInfos(e){const t={...configuration_1.serverConfig.getInfos(e,e.config.name),ready:!!e.config.connection,Postgres:{}};var s={};return e.config.apiVersion===enums_1.EnumVersion.v1_1?t["Ogc link"]="https://docs.ogc.org/is/18-088/18-088.html":t["Ogc link"]="https://docs.ogc.org/is/15-078r6/15-078r6.html",e.config.extensions.includes(enums_1.EnumExtensions.tasking)&&(s.tasking="https://docs.ogc.org/is/17-079r1/17-079r1.html"),e.config.extensions.includes(enums_1.EnumExtensions.logs)&&(s.logs=`${e.decodedUrl.linkbase}/${e.config.apiVersion}/Logs`),t.extensions=s,await(0,helpers_1.executeSqlValues)(e.config,`
    select version(), 
    (SELECT ARRAY(SELECT extname||'-'||extversion AS extension FROM pg_extension) AS extension),
    (SELECT c.relname||'.'||a.attname FROM pg_attribute a JOIN pg_class c ON (a.attrelid=c.relfilenode) WHERE a.atttypid = 114)
    ;`).then(e=>{t.Postgres.version=e[0],t.Postgres.extensions=e[1]}),t}async getStreamInfos(e,t){const s=t.Datastream?"Datastream":t.MultiDatastream?"MultiDatastream":void 0;if(s){var r=exports.models.getEntityName(e,s);if(r){const i=t.FeaturesOfInterest||void 0;t=t[exports.models.DBFull(e)[r].name]||t[exports.models.DBFull(e)[r].singular],t=isNaN(t)?t["@iot.id"]:t;return t?(r=`SELECT "id", "observationType", "_default_foi" FROM ${(0,helpers_2.addDoubleQuotes)(exports.models.DBFull(e)[r].table)} WHERE id = ${BigInt(t)} LIMIT 1`,(0,helpers_1.executeSqlValues)(e,(0,queries_1.asJson)({query:r,singular:!0,strip:!1,count:!1})).then(e=>e?{type:s,id:e[0].id,observationType:e[0].observationType,FoId:i||e[0]._default_foi}:void 0).catch(e=>{log_1.log.errorMsg(e)})):void 0}}}version1_1(s){return["Things","Locations","FeaturesOfInterest","ObservedProperties","Sensors","Datastreams","MultiDatastreams"].forEach(e=>{var t;s[e].columns.properties=(t="properties",{create:"jsonb NULL",alias(){return`"${t}"`},type:"json"})}),s.Locations.columns.geom={create:"geometry NULL",alias(){return'"geom"'},type:"json"},s}isVersionExist(e){if(!0===testVersion(e))return!0;if(!0===this.createVersion(e))return!0;throw new Error((0,messages_1.msg)(messages_1.errors.wrongVersion,e))}createVersion(e){switch(e){case"1.1":case"v1.1":case enums_1.EnumVersion.v1_1:Models.models[enums_1.EnumVersion.v1_1]=this.version1_1((0,helpers_2.deepClone)(Models.models[enums_1.EnumVersion.v1_0]))}return testVersion(e)}filtering(t){return Object.fromEntries(Object.entries(Models.models[t.apiVersion]).filter(([,e])=>Object.keys((0,enums_1.filterEntities)(t)).includes(e.name)))}version(e){if(e&&e.apiVersion&&testVersion(e.apiVersion))return e.apiVersion;throw new Error((0,messages_1.msg)(messages_1.errors.wrongVersion,e.apiVersion))}filteredModelFromConfig(e){return!1===testVersion(e.apiVersion)&&this.createVersion(e.apiVersion),e.name===constants_1.ADMIN?this.DBAdmin(e):this.filtering(e)}DBFull(e){if("string"==typeof e){var t=configuration_1.serverConfig.getConfigNameFromName(e);if(!t)throw new Error(messages_1.errors.configName);!1===testVersion(configuration_1.serverConfig.getConfig(t).apiVersion)&&this.createVersion(configuration_1.serverConfig.getConfig(t).apiVersion),e=configuration_1.serverConfig.getConfig(t)}return Models.models[e.apiVersion]}DBAdmin(e){var t=Models.models[enums_1.EnumVersion.v1_0];return Object.fromEntries(Object.entries(t))}isSingular(e,t){var s;return!(!e||!t||!(s=this.getEntityName(e,t))||Models.models[e.apiVersion][s].singular!=t)}getEntityName(e,t){if(e&&t){const s=Models.models[e.apiVersion],r=t.trim().match(/[a-zA-Z_]/g)?.join("");return s&&r?s.hasOwnProperty(r)?r:Object.keys(s).filter(e=>s[e].table==r.toLowerCase()||s[e].singular==r)[0]:void 0}}getEntity=(e,t)=>{if(e&&t){if("string"==typeof t){var s=this.getEntityName(e,t.trim());if(!s)return;t=s}return"string"==typeof t?Models.models[e.apiVersion][t]:Models.models[e.apiVersion][t.name]}};getRelationColumnTable=(e,t,s)=>{if(e&&t){e=this.getEntity(e,t);if(e)return e.relations.hasOwnProperty(s)?enums_1.EnumColumnType.Relation:e.columns.hasOwnProperty(s)?enums_1.EnumColumnType.Column:void 0}};getSelectColumnList(t){return Object.keys(t.columns).filter(e=>!e.includes("_")).map(e=>(0,helpers_2.addDoubleQuotes)(t.table)+"."+(0,helpers_2.addDoubleQuotes)(e))}getColumnListNameWithoutId(e){return Object.keys(e.columns).filter(e=>!e.includes("_")&&!e.includes("id"))}isColumnType(e,t,s,r){return!!(e&&t&&(e=this.getEntity(e,t))&&e.columns[s]&&e.columns[s].type.toLowerCase()===r.toLowerCase())}getRoot(s){let t=[];switch(Object.keys(s.model).filter(e=>0<s.model[e].order).sort((e,t)=>s.model[e].order>s.model[t].order?1:-1).forEach(e=>{t.push({name:s.model[e].name,url:`${s.decodedUrl.linkbase}/${s.config.apiVersion}/`+e})}),s.config.apiVersion){case enums_1.EnumVersion.v1_0:return{value:t.filter(e=>Object.keys(e).length)};case enums_1.EnumVersion.v1_1:t=t.filter(e=>Object.keys(e).length);var e=[];return e.push(conformance_json_1.default[1.1].root),e.push("https://docs.ogc.org/is/18-088/18-088.html#uri-components"),e.push("https://docs.ogc.org/is/18-088/18-088.html#resource-path"),e.push("https://docs.ogc.org/is/18-088/18-088.html#requesting-data"),e.push("https://docs.ogc.org/is/18-088/18-088.html#create-update-delete"),s.config.extensions.includes(enums_1.EnumExtensions.multiDatastream)&&e.push("https://docs.ogc.org/is/18-088/18-088.html#multidatastream-extension"),s.config.extensions.includes(enums_1.EnumExtensions.mqtt)&&e.push("https://docs.ogc.org/is/18-088/18-088.html#create-observation-dataarray"),e.push("http://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html"),e.push("https://datatracker.ietf.org/doc/html/rfc4180"),{value:t.filter(e=>Object.keys(e).length),serverSettings:{conformance:e}}}}init(){(0,helpers_2.isTest)()&&this.createVersion(configuration_1.serverConfig.getConfig(constants_1.TEST).apiVersion)}}exports.models=new Models;