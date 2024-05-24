"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.createService=void 0;const _1=require("."),configuration_1=require("../../configuration"),constants_1=require("../../constants"),helpers_1=require("../../helpers"),models_1=require("../../models"),helpers_2=require("../../models/helpers"),helper_1=require("../../routes/helper"),dataAccess_1=require("../dataAccess"),prepareDatas=(e,a)=>("Observations"===a&&(!e.resultTime&&e.phenomenonTime&&(e.resultTime=e.phenomenonTime),!e.phenomenonTime)&&e.resultTime&&(e.phenomenonTime=e.resultTime),e),getConvertedData=async e=>fetch(e,{method:"GET",headers:{}}).then(e=>e.json()),addToServiceFromUrl=async(e,a)=>{for(;e;)try{var t=await getConvertedData(e);return await(0,_1.addToService)(a,t),t["@iot.nextLink"]}catch(e){return""}return""},createService=async(r,a)=>{const s={},n=r.create.name,c=configuration_1.serverConfig.getConfig(n),t=`Database [${n}]`,o=async()=>{try{await(0,_1.createDatabase)(n),s["Create "+t]=constants_1._OK,await dataAccess_1.userAccess.post(n,{username:c.pg.user,email:"default@email.com",password:c.pg.password,database:c.pg.database,canPost:!0,canDelete:!0,canCreateUser:!0,canCreateDb:!0,superAdmin:!1,admin:!1})}catch(e){s["Create "+t]=constants_1._NOTOK}},i=(await(0,_1.executeAdmin)((0,helper_1.sqlStopDbName)((0,helpers_1.addSimpleQuotes)(n))).then(async()=>{await(0,_1.executeAdmin)("DROP DATABASE IF EXISTS "+n).then(async()=>{s["Drop "+t]=constants_1._OK,await o()}).catch(e=>{s["Drop "+t]=constants_1._NOTOK})}).catch(async e=>{"3D000"===e.code&&await o()}),models_1.models.filteredModelFromConfig(c));return await(0,helpers_1.asyncForEach)(Object.keys(i).filter(e=>0<i[e].createOrder).sort((e,a)=>i[e].createOrder>i[a].createOrder?1:-1),async a=>{if(r[a]){const t=models_1.models.getEntity(c,a);if(t)try{var e=r[a].map(e=>`INSERT INTO ${(0,helpers_1.addDoubleQuotes)(t.table)} `+(0,helpers_2.createInsertValues)(c,prepareDatas(e,t.name),t.name));await(0,_1.executeSqlValues)(configuration_1.serverConfig.getConfig(n),e.join(";")).then(e=>{s[a]=constants_1._OK}).catch(e=>{s[a]=constants_1._NOTOK})}catch(e){s[a]=constants_1._NOTOK}}}),a&&r.create.imports&&await(0,helpers_1.asyncForEach)(r.create.imports,async e=>{for(e+="&$top=1000";e+"";)e=await addToServiceFromUrl(e,a)}),s};exports.createService=createService;