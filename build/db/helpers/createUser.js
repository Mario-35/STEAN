"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.createUser=void 0;const dataAccess_1=require("../dataAccess"),createUser=async e=>(await dataAccess_1.userAccess.post(e.name,{username:e.pg.user,email:"default@email.com",password:e.pg.password,database:e.pg.database,canPost:!0,canDelete:!0,canCreateUser:!0,canCreateDb:!0,superAdmin:!1,admin:!1}),!0);exports.createUser=createUser;